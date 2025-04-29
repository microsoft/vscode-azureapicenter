// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from "fs-extra";
import * as yaml from 'js-yaml';
import * as path from "path";
import * as vscode from "vscode";
import { ApiSpecExportResultFormat } from "../azure/ApiCenter/contracts";
import { AzureSessionProviderHelper } from "../azure/azureLogin/azureSessionProvider";
import { AIFoundryExtenisonId, AIFoundryExtenisonMinimumVerison } from "../constants";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { UiStrings } from "../uiStrings";
import { EnsureExtension } from "../utils/ensureExtension";
import { createTemporaryFolder } from "../utils/fsUtil";
import { GeneralUtils } from "../utils/generalUtils";
import { treeUtils } from "../utils/treeUtils";
const crypto = require('crypto');
export namespace AIFAgentGenerator {
    export async function generateAIFAgent(context: IActionContext,
        node?: ApiVersionDefinitionTreeItem): Promise<void> {
        if (!node) {
            node = await treeUtils.getDefinitionTreeNode(context);
        }
        if (!node) {
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
        }, async (progress, token) => {
            EnsureExtension.ensureExtension(context, {
                extensionId: AIFoundryExtenisonId,
                noExtensionErrorMessage: vscode.l10n.t(UiStrings.NoAiFoundryExtension, AIFoundryExtenisonMinimumVerison),
                minimumVersion: AIFoundryExtenisonMinimumVerison,
            });

            progress.report({ message: UiStrings.ActivatingAIFoundry });
            await vscode.extensions.getExtension(AIFoundryExtenisonId)?.activate();
        });
        const exportedSpec = await node?.apiCenterApiVersionDefinition.getDefinitions(node?.subscription!, node?.apiCenterName!, node?.apiCenterApiName!, node?.apiCenterApiVersionName!);
        const specJson = await ensureSpecBeJsonFormat(exportedSpec.format, exportedSpec.value);
        await writeToTemplateFile(node, specJson);
    }
    function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
    }

    function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterApiVersionDefinition.getName()}.agent.yaml`;
    }

    async function ensureSpecBeJsonFormat(specFormat: string, specValue: string,): Promise<string> {
        let specContent: string = specFormat === ApiSpecExportResultFormat.inline ? specValue : await GeneralUtils.fetchDataFromLink(specValue);
        try {
            // Check if it's already valid JSON
            JSON.parse(specContent);
            return specContent;
        } catch (error) {
            // If it's not valid JSON, try to parse it as YAML
            try {
                const jsonContent = JSON.stringify(yaml.load(specContent));
                return jsonContent;
            } catch (yamlError) {
                throw new Error(`Failed to parse content as JSON or YAML: ${yamlError}`);
            }
        }
    }


    export async function writeToTemplateFile(node: ApiVersionDefinitionTreeItem, fileContent: string) {
        const folderName = getFolderName(node);
        const folderPath = await createTemporaryFolder(folderName);
        const fileName = getFilename(node);
        const localFilePath: string = path.join(folderPath, fileName);
        await fs.ensureFile(localFilePath);
        const document: vscode.TextDocument = await vscode.workspace.openTextDocument(localFilePath);
        const sessionProvider = await AzureSessionProviderHelper.getSessionProvider();

        const session = await sessionProvider.getAuthSession();
        if (GeneralUtils.failed(session)) {
            throw new Error(UiStrings.ErrorAuthenticating);
        }
        const userName = session.result.account.label;
        const agentFileContent = await generateAgentFile(fileContent, userName);
        const yamlString = yaml.dump(agentFileContent);

        // Write YAML to a file
        fs.writeFileSync(localFilePath, yamlString, 'utf8');
        // Open the file in VS Code editor
        await vscode.window.showTextDocument(document);
        await vscode.commands.executeCommand('azure-ai-foundry.explorerContext.openAgentDesigner', vscode.Uri.file(localFilePath));
    }

    async function generateAgentFile(specContent: string, userId: string) {
        // Parse the spec content to JSON object
        const specObj = JSON.parse(specContent);

        // Extract name and description from the spec
        const apiName = specObj.info?.title || "API";

        // Use these values in the agent creation
        let tool = agentToolTemplate(apiName, specContent);
        let toolsList = [];
        toolsList.push(tool);
        return agentTemplate(`${apiName} Agent`, toolsList, userId);
    }

    export interface IAgentSchema {
        id?: string;
        version: string;
        name: string;
        metadata?: Record<string, any>;
        instructions: string;
        description?: string;
        model: { id: string; options?: { temperature?: number; top_p?: number } };
        tools?: any[];
    }

    export interface IAagentToolSchema {
        type: string;
        id: string;
        description: string;
        options?: {
            auth: { type: string; security_scheme: Record<string, any> };
            specification: string;
        }
    }


    const agentTemplate = (name: string, specTool: any, author: string) => {
        return {
            version: '1.0.0',
            name: name,
            description: 'This is an AI Foundry Agent with an OpenAPI tool',
            id: '',
            metadata: {
                authors: [`${author}`],
                tags: [`${name}`, 'openapi']
            },
            model: {
                id: '',
                options: {
                    temperature: 0.8,
                    top_p: 1
                }
            },
            instructions: `You are an API assistant specialized in working with the ${name} API.
    Your capabilities:
    1. Search and explore available API endpoints in the connected OpenAPI specification
    2. Explain what each API endpoint does and what parameters it requires
    3. Generate code examples in languages like JavaScript, Python, C#, and curl for making API requests
    4. Help troubleshoot common API issues
    5. Recommend appropriate endpoints based on user needs

    When a user asks about functionality, first check if there's a relevant API endpoint and explain how to use it.
    When generating code, include proper error handling and authentication if required.
    Always provide explanatory comments in generated code to help users understand each step.`,
            tools: specTool
        } as IAgentSchema;
    };

    const agentToolTemplate = (name: string, specObj: string) => {
        // Extract description from the spec JSON string
        let description = "API Tool";
        try {
            const parsedSpec = JSON.parse(specObj);
            if (parsedSpec.info && parsedSpec.info.description) {
                description = `This is the openapi agent tool, ${parsedSpec.info.description}`;
            } else if (parsedSpec.info && parsedSpec.info.title) {
                description = `This is the openapi agent tool for ${parsedSpec.info.title}`;
            }
        } catch (error) {
            console.error("Error parsing spec JSON:", error);
        }

        return {
            type: 'openapi',
            id: name,
            description: description,
            options: {
                auth: {
                    type: 'anonymous',
                    security_scheme: {}
                },
                specification: specObj
            }
        } as IAagentToolSchema;
    }
}
