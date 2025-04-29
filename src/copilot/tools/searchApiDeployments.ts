// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { TelemetryUtils } from '../../utils/telemetryUtils';
import { createApiCenterDataPlaneService } from '../utils/dataPlaneUtil';

interface ISearchApiDeploymentsParameters {
    apiName: string;
}

export class SearchApiDeploymentsTool implements vscode.LanguageModelTool<ISearchApiDeploymentsParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<ISearchApiDeploymentsParameters>,
        _token: vscode.CancellationToken
    ) {
        return TelemetryUtils.callLmToolWithTelemetry('lmTool.searchApiDeployments', async () => {
            const apiCenterDataPlaneService = await createApiCenterDataPlaneService();

            const response = (await apiCenterDataPlaneService.listApiDeployments(options.input.apiName)).value;

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))]);
        });
    }
}
