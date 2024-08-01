// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { DataPlaneAccount } from "../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { ext } from "../extensionVariables";
import { UiStrings } from "../uiStrings";
export async function getDataPlaneApis(context: IActionContext): Promise<any | void> {
    const endpointUrl = await vscode.window.showInputBox({ title: UiStrings.AddDataPlaneRuntimeUrl, ignoreFocusOut: true });
    if (!endpointUrl) {
        return;
    }
    const clientid = await vscode.window.showInputBox({ title: UiStrings.AddDataPlaneClientId, ignoreFocusOut: true });
    if (!clientid) {
        return;
    }
    const tenantid = await vscode.window.showInputBox({ title: UiStrings.AddDataPlaneTenantId, ignoreFocusOut: true });
    if (!tenantid) {
        return;
    }
    // return await getSessionToken(clientid, tenantid);
    setAccountToExt(endpointUrl, clientid, tenantid);
    ext.workspaceItem.refresh(context);
}
export function setAccountToExt(domain: string, clientId: string, tenantId: string) {
    function pushIfNotExist(array: DataPlaneAccount[], element: DataPlaneAccount) {
        if (!array.some(item => item.domain === element.domain)) {
            array.push(element);
        }
    }
    pushIfNotExist(ext.dataPlaneAccounts, { domain: domain, tenantId: tenantId, clientId: clientId });
}
