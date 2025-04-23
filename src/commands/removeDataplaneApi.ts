// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { DataPlaneAccount } from "../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { DataPlaneAccountsKey } from "../constants";
import { ext } from "../extensionVariables";
import { ApiServerItem } from "../tree/DataPlaneAccount";
import { UiStrings } from "../uiStrings";
export async function removeDataplaneAPI(context: IActionContext, node: ApiServerItem) {
    let accounts: DataPlaneAccount[] = ext.context.globalState.get(DataPlaneAccountsKey) || [];
    if (accounts.length === 0) {
        vscode.window.showErrorMessage(UiStrings.NoDataPlaneAccountToRemove);
        return;
    }
    let indexToRemove = accounts.findIndex(account =>
        account.domain === node.subscription.subscriptionPath! &&
        account.tenantId === node.subscription.tenantId! &&
        account.clientId === node.subscription.userId!
    );
    if (indexToRemove !== -1) {
        accounts.splice(indexToRemove, 1);
    }
    ext.context.globalState.update(DataPlaneAccountsKey, accounts);
    vscode.commands.executeCommand('azure-api-center.apiCenterWorkspace.refresh');
}
