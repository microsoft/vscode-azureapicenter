// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { ext } from "../extensionVariables";
import { ApiServerItem } from "../tree/DataPlaneAccount";
export async function removeDataplaneAPI(context: IActionContext, node: ApiServerItem) {
    let accounts = ext.dataPlaneAccounts;
    let indexToRemove = accounts.findIndex(account =>
        account.domain === node.parent?.subscription!.subscriptionPath! &&
        account.tenantId === node.parent?.subscription!.tenantId! &&
        account.clientId === node.parent?.subscription!.userId
    );
    if (indexToRemove !== -1) {
        accounts.splice(indexToRemove, 1);
    }
    vscode.commands.executeCommand('azure-api-center.apiCenterWorkspace.refresh');
}
