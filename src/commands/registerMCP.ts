// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenterApi, ApiCenterApiDeployment, ApiCenterApiVersion, ApiCenterApiVersionDefinition, ApiCenterApiVersionDefinitionImport, ApiVersionLifecycleStage } from "../azure/ApiCenter/contracts";
import { ext } from "../extensionVariables";
import { ApiCenterTreeItem } from "../tree/ApiCenterTreeItem";
import { ApisTreeItem } from "../tree/ApisTreeItem";
import { UiStrings } from "../uiStrings";

export async function registerMCP(context: IActionContext, node?: ApisTreeItem) {
    if (!node) {
        const apiCenterNode = await ext.treeDataProvider.showTreeItemPicker<ApiCenterTreeItem>(ApiCenterTreeItem.contextValue, context);
        node = apiCenterNode.apisTreeItem;
    }
    if (!node) {
        return;
    }
    const resourceGroupName = getResourceGroupFromId(node.apiCenter.getId());
    const apiCenterService = new ApiCenterService(node.parent?.subscription!, resourceGroupName, node.apiCenter.getName());

    const mcpApiName = await vscode.window.showInputBox({
        title: UiStrings.APICMCPApiTitle, ignoreFocusOut: true, validateInput: validateInputForTitle
    });
    if (!mcpApiName) {
        throw new UserCancelledError();
    }
    const mcpEndpoint = await vscode.window.showInputBox({
        title: UiStrings.APICMCPEndpoint, ignoreFocusOut: true, validateInput: validateURI
    });
    if (!mcpEndpoint) {
        throw new UserCancelledError();
    }
    const envs = await apiCenterService.getApiCenterEnvironments();
    if (!envs || !envs.value || envs.value.length === 0) {
        vscode.window.showWarningMessage(UiStrings.NoEnvironmentsFound);
    }
    const envNames = envs.value.map(env => env.name);
    const envSelected = await vscode.window.showQuickPick(envNames, { title: UiStrings.SelectApiEnvironment, ignoreFocusOut: true });
    if (!envSelected) {
        throw new UserCancelledError();
    }
    const apiVersionTitle = await vscode.window.showInputBox({ title: UiStrings.ApiVersionTitle, ignoreFocusOut: true, validateInput: validateInputForTitle });
    if (!apiVersionTitle) {
        throw new UserCancelledError();
    }

    const apiVersionLifecycleStage = await vscode.window.showQuickPick(Object.values(ApiVersionLifecycleStage), { title: UiStrings.ApiVersionLifecycle, ignoreFocusOut: true });
    if (!apiVersionLifecycleStage) {
        throw new UserCancelledError();
    }

    await createApiMCP(apiCenterService, mcpApiName, apiVersionTitle, apiVersionLifecycleStage, envSelected, mcpEndpoint);
    node.refresh(context);
}

async function createApiMCP(apiCenterService: ApiCenterService, mcpApiName: string, mcpVersion: string, apiVersionLifecycleStage: string, envSelected: string, mcpEndpoint: string) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: UiStrings.RegisterMCPProgressTitle,
    }, async (progress, token) => {
        const api = {
            name: mcpApiName,
            properties: {
                title: mcpApiName,
                kind: "mcp",
            }
        };
        validateResponse(await apiCenterService.createOrUpdateApi(api as ApiCenterApi));

        const apiVersionName = getNameFromTitle(mcpVersion);
        const apiVersion = {
            name: apiVersionName,
            properties: {
                title: mcpVersion,
                lifecycleStage: apiVersionLifecycleStage.toLowerCase(),
            }
        };
        validateResponse(await apiCenterService.createOrUpdateApiVersion(mcpApiName, apiVersion as ApiCenterApiVersion));

        const sseDefinitionName = "mcp"
        const sseDefinition = {
            name: sseDefinitionName,
            properties: {
                title: "SSE Definition for " + mcpApiName,
            }
        };
        validateResponse(await apiCenterService.createOrUpdateApiVersionDefinition(mcpApiName, apiVersionName, sseDefinition as ApiCenterApiVersionDefinition));

        const srcFilePath = path.join(getTemplatesFolder(), "definition", "mcp.json");
        const fileContent = await fse.readFile(srcFilePath, 'utf8');
        const mcpJson = JSON.parse(fileContent);
        mcpJson.info.version = mcpVersion;
        mcpJson.info.title = mcpApiName;
        mcpJson.servers.push({
            url: mcpEndpoint
        })
        const updatedFileContent = JSON.stringify(mcpJson, null, 2);
        const importMCPPayload = {
            format: "inline",
            value: updatedFileContent,
            specification: {
                name: "openapi",
            }
        };
        validateResponse(await apiCenterService.importSpecification(
            mcpApiName,
            apiVersionName,
            sseDefinitionName,
            importMCPPayload as ApiCenterApiVersionDefinitionImport));


        const deploymentObj = {
            name: "default-deployment",
            properties: {
                title: "Deployment to " + mcpApiName,
                definitionId: `/workspaces/default/apis/${mcpApiName}/versions/${apiVersionName}/definitions/${sseDefinitionName}`,
                environmentId: `/workspaces/default/environments/${envSelected}`,
                isDefault: true,
                server: {
                    runtimeUri: [mcpEndpoint]
                }
            },
            type: "Microsoft.ApiCenter/services/workspaces/apis/deployments"
        }

        validateResponse(await apiCenterService.createOrUpdateApiDeployment(mcpApiName, deploymentObj as ApiCenterApiDeployment));

        vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.RegisterMCPSuccess, mcpApiName));
    })
}

function getNameFromTitle(title: string) {
    return title.trim().toLocaleLowerCase().replace(/ /g, '-').replace(/[^A-Za-z0-9-]/g, '');
}

function getTemplatesFolder(): string {
    return path.join(__dirname, "..", "templates");
}

function validateInputForTitle(value: string) {
    if (!value) {
        return UiStrings.ValueNotBeEmpty;
    }
    const name = getNameFromTitle(value);
    if (name.length < 2) {
        return UiStrings.ValueAtLeast2Char;
    }
    if (!/[a-zA-Z0-9]/.test(name)) {
        return UiStrings.ValueStartWithAlphanumeric;
    }
}

function validateResponse(response: any) {
    if (response && response.message) {
        throw new Error(response.message);
    }
}

function validateURI(value: string) {
    try {
        new URL(value);
        return null; // Valid URL
    } catch (e) {
        return UiStrings.ValidUrlStart; // Invalid URL
    }
}
