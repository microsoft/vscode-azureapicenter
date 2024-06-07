// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";
import { ApisNodeClientProvider } from "../tree/ApisCenterTree";

export async function setupDataPlanProvider(context: IActionContext): Promise<ApisNodeClientProvider | void> {
    const endpointUrl = await vscode.window.showInputBox({ title: "Input Runtime URL", ignoreFocusOut: true });
    const clientid = await vscode.window.showInputBox({ title: "Input Client ID", ignoreFocusOut: true });
    const tenantid = await vscode.window.showInputBox({ title: "Input Tenant ID", ignoreFocusOut: true });
    if (!endpointUrl || !clientid || !tenantid) {
        return;
    }
    const session = await vscode.authentication.getSession('microsoft', [
        `VSCODE_CLIENT_ID:${clientid}`, // Replace by your client id
        `VSCODE_TENANT:${tenantid}`, // Replace with the tenant ID or common if multi-tenant
        "offline_access", // Required for the refresh token.
        "https://azure-apicenter.net/user_impersonation"
    ], { createIfNone: false });
    if (session?.accessToken) {
        return new ApisNodeClientProvider(endpointUrl, session.accessToken);
    } else {
        vscode.window.showErrorMessage("Login in first")
    }
}
export async function getDataPlaneApis(context: IActionContext): Promise<any | void> {
    const endpointUrl = await vscode.window.showInputBox({ title: "Input Runtime URL", ignoreFocusOut: true });
    const clientid = await vscode.window.showInputBox({ title: "Input Client ID", ignoreFocusOut: true });
    const tenantid = await vscode.window.showInputBox({ title: "Input Tenant ID", ignoreFocusOut: true });
    if (!endpointUrl || !clientid || !tenantid) {
        return;
    }
    const session = await vscode.authentication.getSession('microsoft', [
        `VSCODE_CLIENT_ID:${clientid}`, // Replace by your client id
        `VSCODE_TENANT:${tenantid}`, // Replace with the tenant ID or common if multi-tenant
        "offline_access", // Required for the refresh token.
        "https://azure-apicenter.net/user_impersonation"
    ], { createIfNone: false });
    if (session?.accessToken) {
        let index = ext.dataPlaneAccounts.findIndex((item) => item.domain == endpointUrl)
        if (index === -1) {
            ext.dataPlaneAccounts.push({ domain: endpointUrl, accessToken: session.accessToken })
        }
    } else {
        vscode.window.showErrorMessage("please login first");
    }
}
