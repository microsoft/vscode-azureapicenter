// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { DataPlaneAccount, ext } from "../extensionVariables";
export async function getDataPlaneApis(context: IActionContext): Promise<any | void> {
    const endpointUrl = await vscode.window.showInputBox({ title: "Input Runtime URL", ignoreFocusOut: true });
    const clientid = await vscode.window.showInputBox({ title: "Input Client ID", ignoreFocusOut: true });
    const tenantid = await vscode.window.showInputBox({ title: "Input Tenant ID", ignoreFocusOut: true });
    if (!endpointUrl || !clientid || !tenantid) {
        return;
    }
    // return await getSessionToken(clientid, tenantid);
    return setAccountToExt(endpointUrl, clientid, tenantid);
}
export function setAccountToExt(domain: string, clientId: string, tenantId: string) {
    function pushIfNotExist(array: DataPlaneAccount[], element: DataPlaneAccount) {
        if (!array.some(item => item.domain === element.domain)) {
            array.push(element);
        }
    }
    pushIfNotExist(ext.dataPlaneAccounts, { domain: domain, tenantId: tenantId, clientId: clientId });
}

export async function getSessionToken(clientId: string, tenantId: string) {
    const session = await vscode.authentication.getSession('microsoft', [
        `VSCODE_CLIENT_ID:${clientId}`, // Replace by your client id
        `VSCODE_TENANT:${tenantId}`, // Replace with the tenant ID or common if multi-tenant
        "offline_access", // Required for the refresh token.
        "https://azure-apicenter.net/user_impersonation"
    ], { createIfNone: false });
    if (session?.accessToken) {
        return session.accessToken;
    } else {
        vscode.window.showErrorMessage("Please login your Microsoft Account first!");
    }
}
