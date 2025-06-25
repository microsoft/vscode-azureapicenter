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
import { GeneralUtils } from "../utils/generalUtils";

export namespace RegisterMCP {
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
            title: UiStrings.APICMCPApiTitle, ignoreFocusOut: true, validateInput: GeneralUtils.validateInputForTitle
        });
        if (!mcpApiName) {
            throw new UserCancelledError();
        }
        const mcpEndpoint = await vscode.window.showInputBox({
            title: UiStrings.APICMCPEndpoint, ignoreFocusOut: true, validateInput: GeneralUtils.validateURI
        });
        if (!mcpEndpoint) {
            throw new UserCancelledError();
        }
        const envs = await apiCenterService.getApiCenterEnvironments();
        if (!envs || !envs.value || envs.value.length === 0) {
            vscode.window.showWarningMessage(UiStrings.NoEnvironmentsFound);
            return;
        }
        const envNames = envs.value.map(env => env.name);
        const envSelected = await vscode.window.showQuickPick(envNames, { title: UiStrings.SelectApiEnvironment, ignoreFocusOut: true });
        if (!envSelected) {
            throw new UserCancelledError();
        }
        const apiVersionTitle = await vscode.window.showInputBox({ title: UiStrings.ApiVersionTitle, ignoreFocusOut: true, validateInput: GeneralUtils.validateInputForTitle });
        if (!apiVersionTitle) {
            throw new UserCancelledError();
        }

        const apiVersionLifecycleStage = await vscode.window.showQuickPick(Object.values(ApiVersionLifecycleStage), { title: UiStrings.ApiVersionLifecycle, ignoreFocusOut: true });
        if (!apiVersionLifecycleStage) {
            throw new UserCancelledError();
        }

        await RegisterMCP.createApiMCP(apiCenterService, mcpApiName, apiVersionTitle, apiVersionLifecycleStage, envSelected, mcpEndpoint);
        node.refresh(context);
    }

    export async function createApiMCP(apiCenterService: ApiCenterService, mcpApiName: string, mcpVersion: string, apiVersionLifecycleStage: string, envSelected: string, mcpEndpoint: string) {
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

            const apiVersionName = GeneralUtils.getNameFromTitle(mcpVersion);
            const apiVersion = {
                name: apiVersionName,
                properties: {
                    title: mcpVersion,
                    lifecycleStage: apiVersionLifecycleStage.toLowerCase(),
                }
            };
            validateResponse(await apiCenterService.createOrUpdateApiVersion(mcpApiName, apiVersion as ApiCenterApiVersion));

            const mcpDefinitionName = "mcp";
            const sseDefinition = {
                name: mcpDefinitionName,
                properties: {
                    title: "SSE Definition for " + mcpApiName,
                }
            };
            validateResponse(await apiCenterService.createOrUpdateApiVersionDefinition(mcpApiName, apiVersionName, sseDefinition as ApiCenterApiVersionDefinition));

            const importMCPPayload = await RegisterMCP.generateMCPSpec(mcpVersion, mcpApiName, mcpEndpoint);
            validateResponse(await apiCenterService.importSpecification(
                mcpApiName,
                apiVersionName,
                mcpDefinitionName,
                importMCPPayload as ApiCenterApiVersionDefinitionImport));

            const deploymentObj = RegisterMCP.getDeploymentForMCP(mcpApiName, apiVersionName, mcpDefinitionName, envSelected, mcpEndpoint);

            validateResponse(await apiCenterService.createOrUpdateApiDeployment(mcpApiName, deploymentObj as ApiCenterApiDeployment));

            vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.RegisterMCPSuccess, mcpApiName));
        });
    }

    function validateResponse(response: any) {
        if (response && response.message) {
            throw new Error(response.message);
        }
    }

    export async function generateMCPSpec(mcpVersion: string, mcpApiName: string, mcpEndpoint: string): Promise<any> {
        const srcFilePath = path.join(GeneralUtils.getTemplatesFolder(), "definition", "mcp.json");
        const fileContent = await fse.readFile(srcFilePath, 'utf8');
        const mcpJson = JSON.parse(fileContent);
        mcpJson.info.version = mcpVersion;
        mcpJson.info.title = mcpApiName;
        mcpJson.servers.push({
            url: mcpEndpoint
        });
        const updatedFileContent = JSON.stringify(mcpJson, null, 2);
        return {
            format: "inline",
            value: updatedFileContent,
            specification: {
                name: "openapi",
            }
        };
    }

    export function getDeploymentForMCP(mcpApiName: string, apiVersionName: string, mcpDefinitionName: string, envSelected: string, mcpEndpoint: string): any {
        return {
            name: "default-deployment",
            properties: {
                title: "Deployment to " + mcpApiName,
                definitionId: `/workspaces/default/apis/${mcpApiName}/versions/${apiVersionName}/definitions/${mcpDefinitionName}`,
                environmentId: `/workspaces/default/environments/${envSelected}`,
                isDefault: true,
                server: {
                    runtimeUri: [mcpEndpoint]
                }
            },
            type: "Microsoft.ApiCenter/services/workspaces/apis/deployments"
        };
    }
}
