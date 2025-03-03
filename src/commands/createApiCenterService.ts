// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { SubscriptionTreeItem } from "../tree/SubscriptionTreeItem";
import { UiStrings } from "../uiStrings";
export namespace AzureApiCenterService {
    export async function createApiCenterService(actionContext: IActionContext, node?: SubscriptionTreeItem): Promise<void> {
        if (!node) {
            return;
        }
        const resourceGroupName = await vscode.window.showInputBox({ title: UiStrings.ResourceGroupName, ignoreFocusOut: true });
        if (!resourceGroupName) {
            return;
        }
        const apiCenterName = await vscode.window.showInputBox({ title: UiStrings.ApiCenterService, ignoreFocusOut: true });
        if (!apiCenterName) {
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: UiStrings.CreatingApiCenterService
        }, async (progress, token) => {
            const apiCenterService = new ApiCenterService(node.subscriptionContext!, resourceGroupName, apiCenterName);

            const rgExist = await apiCenterService.checkResourceGroup();
            progress.report({ message: UiStrings.CreatingApiVersion });

            if (validaResourceGroup(rgExist)) {
                validateResponse(await apiCenterService.createOrUpdateResourceGroup());
                progress.report({ message: UiStrings.CreatingApiVersion });
            }

            const result = await apiCenterService.createOrUpdateApiCenterService();

            if (result) {
                // Retry mechanism to check API center creation status
                await confrimServerStatusWithRetry(apiCenterService, node, actionContext);
            } else {
                throw new Error(UiStrings.FailedToCreateApiCenterService);
            }
        });
    };
    function validaResourceGroup(response: any): boolean {
        if (response && response.id) {
            return false;
        }
        return true;
    }
    function validateResponse(response: any) {
        if (response && response.message) {
            throw new Error(response.message);
        }
    };
    async function confrimServerStatusWithRetry(apiCenterService: ApiCenterService, node: SubscriptionTreeItem, actionContext: IActionContext) {
        let retryCount = 0;
        const maxRetries = 5;
        const retryDelay = 30000; // 30 seconds

        do {
            try {
                const result = await apiCenterService.getApiCenter();
                if (result && result.properties && result.properties.provisioningState === 'Succeeded') {
                    node.refresh(actionContext);
                    vscode.window.showInformationMessage(UiStrings.CreateResourceSuccess);
                    break;
                }
            } catch (error) {
                throw new Error(UiStrings.FailedToCreateApiCenterService);
            }

            retryCount++;
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        } while (retryCount < maxRetries);
    }
}
