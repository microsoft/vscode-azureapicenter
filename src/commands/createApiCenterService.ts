// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { SubscriptionTreeItem } from "../tree/SubscriptionTreeItem";
import { UiStrings } from "../uiStrings";
import { GeneralUtils } from "../utils/generalUtils";
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
        const serverRes = await apiCenterService.getSubServerList();
        const locations = serverRes.resourceTypes.find((item: any) => item.resourceType === 'services')?.locations;
        if (!locations || locations.length === 0) {
            vscode.window.showWarningMessage(UiStrings.NoLocationAvailable);
            return;
        }
        const location = await vscode.window.showQuickPick(locations, { placeHolder: UiStrings.SelectLocation });
        if (!location) {
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: UiStrings.CreateApiCenterService
        }, async (progress, token) => {
            const rgExist = await apiCenterService.isResourceGroupExist();
            progress.report({ message: UiStrings.GetResourceGroup });
            if (!rgExist) {
                validateResponse(await apiCenterService.createOrUpdateResourceGroup(location));
                progress.report({ message: UiStrings.CreateResourceGroup });
            }
            // Retry mechanism to check API center creation status
            await AzureApiCenterService.createServerStatusWithRetry(apiCenterService, node, actionContext);
            progress.report({ message: UiStrings.CreatingApiCenterService });
        });
    };
    export function validateResponse(response: any) {
        if (response && response.message) {
            throw new Error(response.message);
        }
    };
    export async function createServerStatusWithRetry(apiCenterService: ApiCenterService, node: SubscriptionTreeItem, actionContext: IActionContext) {
        let retryCount = 0;
        const maxRetries = 5;
        const retryDelay = 10000; // 10 seconds

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
            await GeneralUtils.sleep(retryDelay);
        } while (retryCount < maxRetries);
    }
}
