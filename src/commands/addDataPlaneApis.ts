// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { DataPlaneAccount } from "../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { TelemetryClient } from "../common/telemetryClient";
import { DataPlaneApiFromType, TelemetryEvent, TelemetryProperties } from "../common/telemetryEvent";
import { ext } from "../extensionVariables";
import { UiStrings } from "../uiStrings";
export namespace ConnectDataPlaneApi {
    const dataPlaneApiFromInput = "dataPlaneApiFromInput";
    export async function addDataPlaneApis(context: IActionContext): Promise<any | void> {
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
        ConnectDataPlaneApi.sendDataPlaneApiTelemetry(endpointUrl, clientid, tenantid, DataPlaneApiFromType.dataPlaneApiAddFromInput);
        ConnectDataPlaneApi.setAccountToExt(endpointUrl, clientid, tenantid);
        ext.dataPlaneTreeItem.refresh(context);
    }
    export function sendDataPlaneApiTelemetry(runtimeUrl: string, clientId: string, tenantId: string, fromType: DataPlaneApiFromType) {
        const properties: { [key: string]: string; } = {};
        properties[TelemetryProperties.dataPlaneRuntimeUrl] = runtimeUrl;
        properties[TelemetryProperties.dataPlaneTenantId] = tenantId;
        properties[TelemetryProperties.dataPlaneClientId] = clientId;
        properties[TelemetryProperties.dataPlaneAddApiSource] = fromType;
        TelemetryClient.sendEvent(TelemetryEvent.addDataPlaneInstance, properties);
    }
    export function setAccountToExt(domain: string, clientId: string, tenantId: string) {
        function pushIfNotExist(array: DataPlaneAccount[], element: DataPlaneAccount) {
            if (!array.some(item => item.domain === element.domain)) {
                array.push(element);
            } else {
                vscode.window.showInformationMessage(UiStrings.DatplaneAlreadyAdded);
            }
        }
        pushIfNotExist(ext.dataPlaneAccounts, { domain: domain, tenantId: tenantId, clientId: clientId });
    }
}
