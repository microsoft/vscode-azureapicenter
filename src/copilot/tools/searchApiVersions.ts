// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { GeneralUtils } from '../../utils/generalUtils';
import { createApiCenterDataPlaneService } from '../utils/dataPlaneUtil';

interface ISearchApiVersionsParameters {
    apiName: string;
}

export class SearchApiVersionsTool implements vscode.LanguageModelTool<ISearchApiVersionsParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<ISearchApiVersionsParameters>,
        _token: vscode.CancellationToken
    ) {
        // TelemetryClient.sendEvent(TelemetryEvent.getSpectralRulesToolInvoke);

        const apiCenterDataPlaneService = await createApiCenterDataPlaneService();

        if (GeneralUtils.failed(apiCenterDataPlaneService)) {
            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(apiCenterDataPlaneService.error)]);
        }

        const apis = (await apiCenterDataPlaneService.result.getAPiCenterApiVersions(options.input.apiName)).value;

        return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(JSON.stringify(apis, null, 2))]);
    }
}
