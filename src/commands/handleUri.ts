// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { DataPlaneApiFromType } from "../common/telemetryEvent";
import { UiStrings } from "../uiStrings";
import { ConnectDataPlaneApi } from "./addDataPlaneApis";
import { installSkill, parseSkillInstallRequest } from "./installSkill";

export async function handleUri(uri: vscode.Uri) {
    if (uri.path === '/install') {
        await installSkill(parseSkillInstallRequest(new URLSearchParams(uri.query)));
        return;
    }

    const queryParams = new URLSearchParams(uri.query);
    let tenantId = queryParams.get('tenantId') as string;
    let clientId = queryParams.get('clientId') as string;
    let runtimeUrl = queryParams.get('runtimeUrl') as string;
    ConnectDataPlaneApi.sendDataPlaneApiTelemetry(runtimeUrl, clientId, tenantId, DataPlaneApiFromType.dataPlaneApiAddFromDeepLink);
    if (ConnectDataPlaneApi.setAccountToExt(runtimeUrl, clientId, tenantId)) {
        vscode.commands.executeCommand('azure-api-center.apiCenterWorkspace.refresh');
        vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.addDadaPlaneApiSuccess, runtimeUrl));
    }
}

