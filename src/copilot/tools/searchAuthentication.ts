// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { TelemetryUtils } from '../../utils/telemetryUtils';
import { createApiCenterDataPlaneService } from '../utils/dataPlaneUtil';

interface ISearchAuthenticationParameters {
    apiName: string;
    apiVersionName: string;
}

export class searchAuthenticationTool implements vscode.LanguageModelTool<ISearchAuthenticationParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<ISearchAuthenticationParameters>,
        _token: vscode.CancellationToken
    ) {
        return TelemetryUtils.callLmToolWithTelemetry('lmTool.searchAuthentication', async () => {
            const apiCenterDataPlaneService = await createApiCenterDataPlaneService();

            const response = (await apiCenterDataPlaneService.listAuthentication(options.input.apiName, options.input.apiVersionName)).value;

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))]);
        });
    }
}
