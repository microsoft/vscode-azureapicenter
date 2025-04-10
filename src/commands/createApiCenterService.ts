// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenter, ResourceGroup } from "../azure/ApiCenter/contracts";
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
            progress.report({ message: UiStrings.GetResourceGroup });
            const rgExist = await apiCenterService.isResourceGroupExist();
            if (!rgExist) {
                progress.report({ message: UiStrings.CreatingResourceGroup });
                await AzureApiCenterService.confirmResourceGroupWithRetry(apiCenterService, location);
            }

            progress.report({ message: UiStrings.CreatingApiCenterService });
            validateResponse(await apiCenterService.createOrUpdateApiCenterService(location));
            // Retry mechanism to check API center creation status
            await AzureApiCenterService.confirmServerStatusWithRetry(apiCenterService, node, actionContext);
        });
    };
    export function validateResponse(response: any) {
        if (response && (response as any).message) {
            throw new Error((response as any).message);
        }
    };
    export async function confirmResourceGroupWithRetry(apiCenterService: ApiCenterService, location: string) {
        let retryCount = 0;
        const maxRetries = 5;
        const retryDelay = 10000; // 10 seconds
        let result: ResourceGroup;
        do {
            validateResponse(result = await apiCenterService.createOrUpdateResourceGroup(location));
            if (result && result.properties && result.properties.provisioningState && result.properties.provisioningState === 'Succeeded') {
                break;
            }
            retryCount++;
            await GeneralUtils.sleep(retryDelay);
        } while (retryCount < maxRetries);
        if (retryCount >= maxRetries) {
            throw new Error(UiStrings.LongTimeToCreateResourceGroup);
        }
    };
    export async function confirmServerStatusWithRetry(apiCenterService: ApiCenterService, node: SubscriptionTreeItem, actionContext: IActionContext) {
        let retryCount = 0;
        const maxRetries = 5;
        const retryDelay = 10000; // 10 seconds
        let result: ApiCenter;
        do {
            try {
                result = await apiCenterService.getApiCenter();
                if (result && result.provisioningState && result.provisioningState === 'Succeeded') {
                    node.refresh(actionContext);
                    vscode.window.showInformationMessage(UiStrings.CreateResourceSuccess);
                    break;
                }
            } catch (error) {
                throw new Error(vscode.l10n.t(UiStrings.FailedToCreateApiCenterService, GeneralUtils.getErrorMessage(error)));
            }

            retryCount++;
            await GeneralUtils.sleep(retryDelay);
        } while (retryCount < maxRetries);
        if (retryCount >= maxRetries) {
            throw new Error(UiStrings.LongTimeToCreateApiCenterService);
        }
    };
}
