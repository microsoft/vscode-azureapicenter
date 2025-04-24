// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { DataPlaneAccount } from "../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { TelemetryClient } from "../common/telemetryClient";
import { DataPlaneApiFromType, TelemetryEvent, TelemetryProperties } from "../common/telemetryEvent";
import { DataPlaneAccountsKey } from "../constants";
import { ext } from "../extensionVariables";
import { UiStrings } from "../uiStrings";
export namespace ConnectDataPlaneApi {
    export async function addDataPlaneApis(context: IActionContext): Promise<any | void> {
        const endpointUrl = await vscode.window.showInputBox({ title: UiStrings.AddDataPlaneRuntimeUrl, ignoreFocusOut: true });
        if (!endpointUrl) {
            throw new UserCancelledError();
        }
        const clientid = await vscode.window.showInputBox({ title: UiStrings.AddDataPlaneClientId, ignoreFocusOut: true });
        if (!clientid) {
            throw new UserCancelledError();
        }
        const tenantid = await vscode.window.showInputBox({ title: UiStrings.AddDataPlaneTenantId, ignoreFocusOut: true });
        if (!tenantid) {
            throw new UserCancelledError();
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
    export async function setAccountToExt(domain: string, clientId: string, tenantId: string) {
        function updateAccountsIfNotExist(element: DataPlaneAccount) {
            let array: DataPlaneAccount[] = ext.context.globalState.get(DataPlaneAccountsKey) || [];
            if (!array.some(item => item.domain === element.domain)) {
                array.push(element);
                ext.context.globalState.update(DataPlaneAccountsKey, array);
            } else {
                vscode.window.showInformationMessage(UiStrings.DatplaneAlreadyAdded);
            }
        }
        updateAccountsIfNotExist({ domain: domain, tenantId: tenantId, clientId: clientId });
    }
}
