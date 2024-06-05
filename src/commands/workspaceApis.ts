// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
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
export async function getApis(context: IActionContext): Promise<any | void> {
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
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + session?.accessToken
        };
        const response = await fetch(`https://${endpointUrl}/workspaces/default/apis`, { method: "GET", headers: headers });

        if (!response.ok) {
            return;
        }
        const dataJson = await response.json();
        return dataJson.value;
    } else {
        vscode.window.showErrorMessage("please login first");
    }
}
