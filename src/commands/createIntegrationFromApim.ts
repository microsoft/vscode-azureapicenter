// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenterApiSource, ApiCenterApiSourcePayload } from "../azure/ApiCenter/contracts";
import { ResourceGraphService } from "../azure/ResourceGraph/ResourceGraphService";
import { ext } from "../extensionVariables";
import { IntegrationsTreeItem } from "../tree/IntegrationsTreeItem";
import { SubscriptionTreeItem } from "../tree/SubscriptionTreeItem";

export async function createIntegrationFromApim(context: IActionContext, node: IntegrationsTreeItem) {
    const resourceGroupName = getResourceGroupFromId(node.apiCenter.id);
    const apiCenterService = new ApiCenterService(node.subscription, resourceGroupName, node.apiCenter.name);

    const apimResourceId = await selectApim(context);

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Creating integration with Azure API Management",
    }, async (progress, token) => {
        const apiSource = await createIntegration(apiCenterService, apimResourceId);

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

async function createIntegration(apiCenterService: ApiCenterService, apimResourceId: string): Promise<ApiCenterApiSource> {
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
    const apiSource = await apiCenterService.createOrUpdateIntegration("test-integration", apiSourcePayload);

    validateResponse(apiSource);

    return apiSource;
}

function validateResponse(response: any) {
    if (response && response.message) {
        throw new Error(response.message);
    }
}
