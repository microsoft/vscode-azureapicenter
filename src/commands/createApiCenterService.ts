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
        const serverName = await vscode.window.showInputBox({ title: UiStrings.ServiceName, prompt: UiStrings.GlobalServiceNamePrompt, ignoreFocusOut: true });
        if (!serverName) {
            return;
        }

        const apiCenterService = new ApiCenterService(node.subscriptionContext!, serverName, serverName);

        const serverRes = await apiCenterService.getApiServerList();

        const locations = serverRes.resourceTypes.find((item: any) => item.resourceType === 'services').locations;

        const location = await vscode.window.showQuickPick(locations, { placeHolder: UiStrings.SelectLocation });
        if (!location) {
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: UiStrings.CreatingApiCenterService
        }, async (progress, token) => {
            const rgExist = await apiCenterService.checkResourceGroup();
            progress.report({ message: UiStrings.CreatingApiVersion });

            if (validaResourceGroup(rgExist)) {
                validateResponse(await apiCenterService.createOrUpdateResourceGroup(location));
                progress.report({ message: UiStrings.CreatingApiVersion });
            }

            const result = await apiCenterService.createOrUpdateApiCenterService(location);

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
                if (result && result.provisioningState && result.provisioningState === 'Succeeded') {
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
