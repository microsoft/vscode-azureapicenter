// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { TelemetryUtils } from '../../utils/telemetryUtils';
import { createApiCenterDataPlaneService } from '../utils/dataPlaneUtil';

export class SearchApisTool implements vscode.LanguageModelTool<void> {
    async invoke(
        _options: vscode.LanguageModelToolInvocationOptions<void>,
        _token: vscode.CancellationToken
    ) {
        return TelemetryUtils.callLmToolWithTelemetry('lmTool.searchApis', async () => {
            const apiCenterDataPlaneService = await createApiCenterDataPlaneService();

            const response = (await apiCenterDataPlaneService.getApiCenterApis()).value;

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))]);
        });
    }
}
