// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from "fs-extra";
import * as yaml from 'js-yaml';
import * as path from "path";
import * as vscode from "vscode";
import { ApiSpecExportResultFormat } from "../azure/ApiCenter/contracts";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { createTemporaryFolder } from "../utils/fsUtil";
import { GeneralUtils } from "../utils/generalUtils";
import { treeUtils } from "../utils/treeUtils";
export namespace AIFAgentGenerator {
    export async function generateAIFAgent(context: IActionContext,
        node?: ApiVersionDefinitionTreeItem): Promise<void> {
        if (!node) {
            node = await treeUtils.getDefinitionTreeNode(context);
        }
        if (!node) {
            return;
        }
        const exportedSpec = await node?.apiCenterApiVersionDefinition.getDefinitions(node?.subscription!, node?.apiCenterName!, node?.apiCenterApiName!, node?.apiCenterApiVersionName!);
        await writeToTempFile(node!, exportedSpec.format, exportedSpec.value);
    }
    function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
    }

    function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterApiVersionDefinition.getName()}.yaml`;
    }

    async function writeToTempFile(node: ApiVersionDefinitionTreeItem, specFormat: string, specValue: string) {
        if (specFormat === ApiSpecExportResultFormat.inline) {
            await AIFAgentGenerator.showTempFile(node, specValue);
        } else if (specFormat === ApiSpecExportResultFormat.link) {
            await AIFAgentGenerator.showTempFile(node, await GeneralUtils.fetchDataFromLink(specValue));
        }
    }

    export async function showTempFile(node: ApiVersionDefinitionTreeItem, fileContent: string) {
        const folderName = getFolderName(node);
        const folderPath = await createTemporaryFolder(folderName);
        const fileName = getFilename(node);
        const localFilePath: string = path.join(folderPath, fileName);
        await fs.ensureFile(localFilePath);
        const document: vscode.TextDocument = await vscode.workspace.openTextDocument(localFilePath);
        const agentFileContent = await generateAgentFile(fileContent);
        // const agentFileString: string = JSON.stringify(agentFileContent, null, 2);
        // await vscode.workspace.fs.writeFile(vscode.Uri.file(localFilePath), Buffer.from(agentFileString));
        // Convert object to YAML string
        const yamlString = yaml.dump(agentFileContent);

        // Write YAML to a file
        fs.writeFileSync(localFilePath, yamlString, 'utf8');
        // Open the file in VS Code editor
        await vscode.window.showTextDocument(document);
        // await vscode.commands.executeCommand('azure-ai-foundry.explorerContext.openAgentDesigner', vscode.Uri.file(localFilePath));
    }

    async function generateAgentFile(specContent: string) {
        // const obj = JSON.parse(specContent);
        let tool = agentToolTemplate("openapi", "generate openapi spec for AI Foundry agent", specContent);
        let toolsList = [];
        toolsList.push(tool);
        return agentTemplate("PetStore Agent for Ai Foundry", toolsList);
    }

    interface IAgentSchema {
        id?: string;
        version: string;
        type: string;
        name: string;
        instructions: string;
        description?: string;
        model: { id: string; configuration: any; options: any };
        tools?: any[];
        inputs?: any[];
        outputs?: any[];
        template?: any[];
    }

    const agentTemplate = (name: string, specTool: any) => {
        return {
            version: '1.0.0',
            type: 'Swagger Petstore Agent',
            name: name,
            description: 'Description of the agent',
            id: 'PetstoreAgent',
            model: {
                id: '',
                options: {
                    temperature: 1
                },
                configuration: {
                    type: 'aifoundry'
                }
            },
            metadata: {
                author: 'wenyutang@microsoft.com',
                tag: 'petstore',
            },
            instructions: 'You are an agent that can answer questions about the petstore API.',
            tools: specTool,
        } as IAgentSchema;
    }

    const agentToolTemplate = (name: string, description: string, specObj: any) => {
        return {
            type: 'openapi',
            name: name,
            description: description,
            options: {
                auth: {
                    type: 'anonymous',
                    security_scheme: {}
                },
                specification: [specObj]
            }
        };
    }
}
