// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { exitFromSession } from "../commands/workspaceApis";
import { ext } from "../extensionVariables";
import { ApiServerItem } from "../tree/DataPlaneAccount";

export async function removeDataplaneAPI(context: IActionContext, node: ApiServerItem) {
    let accounts = ext.dataPlaneAccounts;
    let indexToRemove = accounts.findIndex(account =>
        account.domain === node.apiAccount.domain &&
        account.tenantId === node.apiAccount.tenantId &&
        account.clientId === node.apiAccount.clientId
    );
    if (indexToRemove !== -1) {
        accounts.splice(indexToRemove, 1);
    }
    let isExist = accounts.some(account =>
        account.tenantId === node.apiAccount.tenantId && account.clientId === node.apiAccount.clientId
    );
    if (!isExist) {
        await exitFromSession(node.apiAccount.clientId, node.apiAccount.tenantId);
    }
    vscode.commands.executeCommand('azure-api-center.apiCenterWorkspace.refresh');
}
