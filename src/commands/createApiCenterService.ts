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
                vscode.window.showInformationMessage(UiStrings.ApiIsRegistered);
                node.refresh(actionContext);
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
}
