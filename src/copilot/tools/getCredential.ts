// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { TelemetryUtils } from '../../utils/telemetryUtils';
import { createApiCenterDataPlaneService } from '../utils/dataPlaneUtil';

interface IGetCredentialParameters {
    apiName: string;
    apiVersionName: string;
    authenticationName: string;
}

export class GetCredentialTool implements vscode.LanguageModelTool<IGetCredentialParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<IGetCredentialParameters>,
        _token: vscode.CancellationToken
    ) {
        return TelemetryUtils.callLmToolWithTelemetry('lmTool.getCredential', async () => {
            const apiCenterDataPlaneService = await createApiCenterDataPlaneService();

            const response = await apiCenterDataPlaneService.getCredential(options.input.apiName, options.input.apiVersionName, options.input.authenticationName);

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))]);
        });
    }
}
