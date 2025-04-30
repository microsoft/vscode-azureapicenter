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

            let languageModelText = "";

            if (response && response.length > 0) {
                languageModelText = `Unless user want to get all the deployments, select the deployment where the 'isDefault' property is set to true.
Here are the details of the deployments for the API '${options.input.apiName}':
${JSON.stringify(response, null, 2)}`;
            }

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(languageModelText)]);
        });
    }
}
