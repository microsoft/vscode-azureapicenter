// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { DataPlaneApiFromType } from "../common/telemetryEvent";
import { ConnectDataPlaneApi } from "./addDataPlaneApis";
export async function handleUri(uri: vscode.Uri) {
    const queryParams = new URLSearchParams(uri.query);
    let tenantId = queryParams.get('tenantId') as string;
    let clientId = queryParams.get('clientId') as string;
    let runtimeUrl = queryParams.get('runtimeUrl') as string;
    ConnectDataPlaneApi.sendDataPlaneApiTelemetry(runtimeUrl, clientId, tenantId, DataPlaneApiFromType.dataPlaneApiAddFromDeepLink);
    ConnectDataPlaneApi.setAccountToExt(runtimeUrl, clientId, tenantId);
    vscode.commands.executeCommand('azure-api-center.apiCenterWorkspace.refresh');
};
