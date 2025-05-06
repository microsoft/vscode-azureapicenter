// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { TelemetryUtils } from '../../utils/telemetryUtils';
import { createApiCenterDataPlaneService } from '../utils/dataPlaneUtil';

interface ISearchApiVersionsParameters {
    apiName: string;
}

export class SearchApiVersionsTool implements vscode.LanguageModelTool<ISearchApiVersionsParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<ISearchApiVersionsParameters>,
        _token: vscode.CancellationToken
    ) {
        return TelemetryUtils.callWithTelemetry<vscode.LanguageModelToolResult>('lmTool.searchApiVersions', async () => {
            const apiCenterDataPlaneService = await createApiCenterDataPlaneService();

            const response = (await apiCenterDataPlaneService.getAPiCenterApiVersions(options.input.apiName)).value;

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))]);
        });
    }
}
