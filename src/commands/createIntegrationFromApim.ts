// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, ISubscriptionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenter, ApiCenterApiSource, ApiCenterApiSourcePayload, ApiCenterPayload } from "../azure/ApiCenter/contracts";
import { AzureService } from "../azure/AzureService/AzureService";
import { RoleAssignmentPayload } from "../azure/AzureService/contracts";
import { ResourceGraphService } from "../azure/ResourceGraph/ResourceGraphService";
import { ext } from "../extensionVariables";
import { IntegrationsTreeItem } from "../tree/IntegrationsTreeItem";
import { SubscriptionTreeItem } from "../tree/SubscriptionTreeItem";

export async function createIntegrationFromApim(context: IActionContext, node: IntegrationsTreeItem) {
    const resourceGroupName = getResourceGroupFromId(node.apiCenter.id);
    const apiCenterService = new ApiCenterService(node.subscription, resourceGroupName, node.apiCenter.name);

    const apimResourceId = await selectApim(context);

    const linkName = await vscode.window.showInputBox({
        title: "Link Name",
        ignoreFocusOut: true,
        validateInput: (value: string) => {
            if (!value) {
                return "Link name is required.";
            }
            const validPattern = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
            if (!validPattern.test(value)) {
                return "Must contain only letters, numbers, and dashes. Dashes must be preceded and followed by a letter or number.";
            }
            return undefined;
        }
    });

    if (!linkName) {
        throw new UserCancelledError();
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Creating integration with Azure API Management",
    }, async (progress, token) => {
        const updatedApiCenter = await enableSystemAssignedManagedIdentity(apiCenterService);

        await assignManagedIdentityReaderRole(node.subscription, updatedApiCenter, apimResourceId);

        const apiSource = await createIntegration(apiCenterService, linkName, apimResourceId);

        vscode.window.showInformationMessage(`Integration '${apiSource.name}' created successfully.`);
        node.refresh(context);
    });
}

async function selectApim(context: IActionContext): Promise<string> {
    const subscriptionTreeItem = await ext.treeDataProvider.showTreeItemPicker<SubscriptionTreeItem>(SubscriptionTreeItem.contextValue, context);
    const resourceGraphService = new ResourceGraphService(subscriptionTreeItem.subscription);

    const apims = await resourceGraphService.listApims();
    if (!apims || apims.length === 0) {
        throw new Error("No API Management services found in the subscription.");
    }

    const apimNames = apims.map(apim => apim.name);
    const selectedApimName = await vscode.window.showQuickPick(apimNames, { title: "Select an API Management service", ignoreFocusOut: true });
    if (!selectedApimName) {
        throw new UserCancelledError();
    }

    const selectedApim = apims.find(apim => apim.name === selectedApimName);
    return selectedApim.id;
}

async function enableSystemAssignedManagedIdentity(apiCenterService: ApiCenterService): Promise<ApiCenter> {
    const apiCenter = await apiCenterService.getApiCenter();
    if (!apiCenter.identity?.principalId) {
        const apiCenterPayload: ApiCenterPayload = {
            location: apiCenter.location,
            identity: {
                type: "SystemAssigned"
            },
            sku: {
                name: apiCenter.sku.name
            }
        };
        const updatedApiCenter = await apiCenterService.createOrUpdateApiCenterService(apiCenterPayload);
        validateResponse(updatedApiCenter);
        vscode.window.showInformationMessage("System assigned managed identity enabled for the API Center service.");
        return updatedApiCenter;
    } else {
        vscode.window.showInformationMessage("System assigned managed identity is already enabled for the API Center service.");
        return apiCenter;
    }
}

async function assignManagedIdentityReaderRole(subscriptionContext: ISubscriptionContext, apiCenter: ApiCenter, apimResourceId: string): Promise<void> {
    const azureService = new AzureService(subscriptionContext);
    const roleAssignmentPayload: RoleAssignmentPayload = {
        properties: {
            roleDefinitionId: `/subscriptions/${subscriptionContext.subscriptionId}/providers/Microsoft.Authorization/roleDefinitions/71522526-b88f-4d52-b57f-d31fc3546d0d`, // 'API Management Service Reader' role
            principalId: apiCenter.identity!.principalId!,
            principalType: "ServicePrincipal"
        }
    };
    const scope = apimResourceId.substring(1);
    const response = await azureService.createOrUpdateRoleAssignment(scope, roleAssignmentPayload);
    if (![200, 201, 409].includes(response.status)) {
        throw new Error(`Failed to assign role: ${response.bodyAsText}`);
    }
}

async function createIntegration(apiCenterService: ApiCenterService, linkName: string, apimResourceId: string): Promise<ApiCenterApiSource> {
    const apiSourcePayload: ApiCenterApiSourcePayload = {
        properties: {
            apiSourceType: "apim",
            apimSource: {
                resourceId: apimResourceId
            },
            shouldImportSpec: true
            // targetEnvironmentId: "your-target-environment-id"
        }
    };
    const apiSource = await apiCenterService.createOrUpdateIntegration(linkName, apiSourcePayload);

    validateResponse(apiSource);

    return apiSource;
}

function validateResponse(response: any) {
    if (response?.message) {
        throw new Error(response.message);
    }
    if (response?.error?.message) {
        throw new Error(response.error.message);
    }
}
