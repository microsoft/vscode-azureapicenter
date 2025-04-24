// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { GeneralUtils } from '../../utils/generalUtils';
import { createApiCenterDataPlaneService } from '../utils/dataPlaneUtil';

export class SearchApisTool implements vscode.LanguageModelTool<void> {
    async invoke(
        _options: vscode.LanguageModelToolInvocationOptions<void>,
        _token: vscode.CancellationToken
    ) {
        // TelemetryClient.sendEvent(TelemetryEvent.getSpectralRulesToolInvoke);

        const apiCenterDataPlaneService = await createApiCenterDataPlaneService();

        if (GeneralUtils.failed(apiCenterDataPlaneService)) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(apiCenterDataPlaneService.error)]);
        }

        const apis = (await apiCenterDataPlaneService.result.getApiCenterApis()).value;

        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(JSON.stringify(apis, null, 2))]);
    }
}
