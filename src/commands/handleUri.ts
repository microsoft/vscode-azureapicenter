// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { setAccountToExt } from "./addDataPlaneApis";
export async function handleUri(uri: vscode.Uri) {
    const queryParams = new URLSearchParams(uri.query);
    let tenantId = queryParams.get('tenantId') as string;
    let clientId = queryParams.get('clientId') as string;
    let runtimeUrl = queryParams.get('runtimeUrl') as string;
    setAccountToExt(runtimeUrl, clientId, tenantId);
    vscode.commands.executeCommand('azure-api-center.apiCenterWorkspace.refresh');
};
