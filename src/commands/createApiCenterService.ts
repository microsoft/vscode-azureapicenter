// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ResourceGroup } from "../azure/ApiCenter/contracts";
import { ResourceGraphService } from "../azure/ResourceGraph/ResourceGraphService";
import { ext } from "../extensionVariables";
import { SubscriptionTreeItem } from "../tree/SubscriptionTreeItem";
import { UiStrings } from "../uiStrings";
import { GeneralUtils } from "../utils/generalUtils";
export namespace CreateAzureApiCenterService {
    export async function createApiCenterService(context: IActionContext, node?: SubscriptionTreeItem): Promise<void> {
        if (!node) {
            node = await ext.treeDataProvider.showTreeItemPicker<SubscriptionTreeItem>(SubscriptionTreeItem.contextValue, context);
        }
        if (!node) {
            throw new UserCancelledError();
        }
        const serverName = await vscode.window.showInputBox({
            title: UiStrings.ServiceName, prompt: UiStrings.GlobalServiceNamePrompt, ignoreFocusOut: true, validateInput: validateInputName
        });
        if (!serverName) {
            throw new UserCancelledError();
        }
        const apiCenterService = new ApiCenterService(node.subscriptionContext!, serverName, serverName);
        const serverRes = await apiCenterService.listApiCenterServers();
        const locations = serverRes.resourceTypes.find((item: any) => item.resourceType === 'services')?.locations;
        if (!locations || locations.length === 0) {
            vscode.window.showWarningMessage(UiStrings.NoLocationAvailable);
            return;
        }
        const location = await vscode.window.showQuickPick(locations, { placeHolder: UiStrings.SelectLocation });
        if (!location) {
            throw new UserCancelledError();
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: UiStrings.CreateApiCenterService
        }, async (progress, token) => {
            progress.report({ message: UiStrings.GetResourceGroup });
            const rgExist = await apiCenterService.isResourceGroupExist();
            if (!rgExist) {
                progress.report({ message: UiStrings.CreatingResourceGroup });
                await CreateAzureApiCenterService.confirmResourceGroupWithRetry(apiCenterService, location);
            }

            progress.report({ message: UiStrings.CreatingApiCenterService });
            validateResponse(await apiCenterService.createOrUpdateApiCenterService(location));
            // Retry mechanism to check API center creation status
            await CreateAzureApiCenterService.confirmServerStatusWithRetry(serverName, node!, context);
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
    export async function confirmServerStatusWithRetry(serverName: string, node: SubscriptionTreeItem, context: IActionContext) {
        let retryCount = 0;
        const maxRetries = 5;
        const retryDelay = 10000; // 10 seconds
        do {
            try {
                const resourceGraphService = new ResourceGraphService(node.subscription);
                const apiCenter = await resourceGraphService.queryApiCenterByName(serverName);
                if (apiCenter && apiCenter.length > 0) {
                    await node.refresh(context);
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

    async function validateInputName(input: string): Promise<string | undefined> {
        if (!input) return UiStrings.InputNameShouldNotBeEmpty;
        if (input.length > 90) return UiStrings.InputNameTooLong;
        if (!/^[\w\.\-\(\)]+$/.test(input)) return UiStrings.InputNameWithInvalidCharacter;
        if (input.endsWith('.')) return UiStrings.InputNameShouldNotEndWithPeriod;
        return undefined;
    }
}
