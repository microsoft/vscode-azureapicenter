// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { TelemetryClient } from "../common/telemetryClient";
import { TelemetryEvent, TelemetryProperties } from "../common/telemetryEvent";
import { setAccountToExt } from "./addDataPlaneApis";
export async function handleUri(uri: vscode.Uri) {
    const queryParams = new URLSearchParams(uri.query);
    let tenantId = queryParams.get('tenantId') as string;
    let clientId = queryParams.get('clientId') as string;
    let runtimeUrl = queryParams.get('runtimeUrl') as string;
    setAccountToExt(runtimeUrl, clientId, tenantId);
    const properties: { [key: string]: string; } = {};
    properties[TelemetryProperties.dataPlaneRuntimeUrl] = runtimeUrl;
    properties[TelemetryProperties.dataPlaneTenantId] = tenantId;
    properties[TelemetryProperties.dataPlaneClientId] = clientId;
    TelemetryClient.sendEvent(TelemetryEvent.openUrlFromDataPlane, properties);
    vscode.commands.executeCommand('azure-api-center.apiCenterWorkspace.refresh');
};
