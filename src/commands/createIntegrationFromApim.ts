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
import { APIManagementServiceReaderRoleId } from "../constants";
import { ext } from "../extensionVariables";
import { ApiCenterTreeItem } from "../tree/ApiCenterTreeItem";
import { IntegrationsTreeItem } from "../tree/IntegrationsTreeItem";
import { SubscriptionTreeItem } from "../tree/SubscriptionTreeItem";
import { UiStrings } from "../uiStrings";
import { GeneralUtils } from "../utils/generalUtils";

export async function createIntegrationFromApim(context: IActionContext, node?: IntegrationsTreeItem) {
    if (!node) {
        const apiCenterNode = await ext.treeDataProvider.showTreeItemPicker<ApiCenterTreeItem>(ApiCenterTreeItem.contextValue, context);
        node = apiCenterNode.integrationsTreeItem;
    }

    const resourceGroupName = getResourceGroupFromId(node.apiCenter.id);
    const apiCenterService = new ApiCenterService(node.subscription, resourceGroupName, node.apiCenter.name);

    const apimResourceId = await selectApim(context);

    const linkName = await vscode.window.showInputBox({
        title: UiStrings.LinkName,
        ignoreFocusOut: true,
        validateInput: (value: string) => {
            if (!value) {
                return UiStrings.LinkNameRequired;
            }
            const validPattern = /^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$/;
            if (!validPattern.test(value)) {
                return UiStrings.LinkNameInvalid;
            }
            return undefined;
        }
    });

    if (!linkName) {
        throw new UserCancelledError();
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: UiStrings.CreatingIntegration,
    }, async (progress, token) => {
        const updatedApiCenter = await enableSystemAssignedManagedIdentity(apiCenterService);

        await assignManagedIdentityReaderRole(node!.subscription, updatedApiCenter, apimResourceId);

        const apiSource = await createIntegration(apiCenterService, linkName, apimResourceId);

        vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.IntegrationCreated, apiSource.name));
        node!.refresh(context);
    });
}

async function selectApim(context: IActionContext): Promise<string> {
    const subscriptionTreeItem = await ext.treeDataProvider.showTreeItemPicker<SubscriptionTreeItem>(SubscriptionTreeItem.contextValue, context);
    const resourceGraphService = new ResourceGraphService(subscriptionTreeItem.subscription);

    const apims = await resourceGraphService.listApims();
    if (!apims || apims.length === 0) {
        throw new Error(UiStrings.NoAPIManagementFound);
    }

    const apimNames = apims.map(apim => apim.name);
    const selectedApimName = await vscode.window.showQuickPick(apimNames, { title: UiStrings.SelectAPIManagementService, ignoreFocusOut: true });
    if (!selectedApimName) {
        throw new UserCancelledError();
    }

    const selectedApim = apims.find(apim => apim.name === selectedApimName);
    return selectedApim.id;
}

async function enableSystemAssignedManagedIdentity(apiCenterService: ApiCenterService): Promise<ApiCenter> {
    const apiCenter = await apiCenterService.getApiCenter();
    if (apiCenter.identity?.principalId) {
        return apiCenter;
    } else {
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
        GeneralUtils.validateResponse(updatedApiCenter);
        return updatedApiCenter;
    }
}

async function assignManagedIdentityReaderRole(subscriptionContext: ISubscriptionContext, apiCenter: ApiCenter, apimResourceId: string): Promise<void> {
    const azureService = new AzureService(subscriptionContext);
    const roleAssignmentPayload: RoleAssignmentPayload = {
        properties: {
            roleDefinitionId: `/subscriptions/${subscriptionContext.subscriptionId}/providers/Microsoft.Authorization/roleDefinitions/${APIManagementServiceReaderRoleId}`, // 'API Management Service Reader' role
            principalId: apiCenter.identity!.principalId!,
            principalType: "ServicePrincipal"
        }
    };
    const scope = apimResourceId.substring(1);
    const response = await azureService.createOrUpdateRoleAssignment(scope, roleAssignmentPayload);
    if (![200, 201, 409].includes(response.status)) {
        throw new Error(vscode.l10n.t(UiStrings.FailedToAssignManagedIdentityReaderRole, response.bodyAsText ?? ""));
    }
}

async function createIntegration(apiCenterService: ApiCenterService, linkName: string, apimResourceId: string): Promise<ApiCenterApiSource> {
    const apiSourcePayload: ApiCenterApiSourcePayload = {
        properties: {
            apiSourceType: "apim",
            apimSource: {
                resourceId: apimResourceId
            }
        }
    };
    const apiSource = await apiCenterService.createOrUpdateIntegration(linkName, apiSourcePayload);

    GeneralUtils.validateResponse(apiSource);

    return apiSource;
}
