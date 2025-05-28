// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { TelemetryUtils } from '../../utils/telemetryUtils';
import { createApiCenterDataPlaneService } from '../utils/dataPlaneUtil';

interface ISearchApiDefinitionsParameters {
    apiName: string;
    apiVersionName: string;
}

export class SearchApiDefinitionsTool implements vscode.LanguageModelTool<ISearchApiDefinitionsParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<ISearchApiDefinitionsParameters>,
        _token: vscode.CancellationToken
    ) {
        return TelemetryUtils.callWithTelemetry<vscode.LanguageModelToolResult>('lmTool.searchApiDefinitions', async () => {
            const apiCenterDataPlaneService = await createApiCenterDataPlaneService();

            const response = (await apiCenterDataPlaneService.getApiCenterApiDefinitions(options.input.apiName, options.input.apiVersionName)).value;

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))]);
        });
    }
}
