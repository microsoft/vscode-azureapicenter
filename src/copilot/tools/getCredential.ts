// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { ext } from '../../extensionVariables';
import { UiStrings } from '../../uiStrings';
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
        return TelemetryUtils.callWithTelemetry<vscode.LanguageModelToolResult>('lmTool.getCredential', async () => {
            const apiCenterDataPlaneService = await createApiCenterDataPlaneService();

            const credential = await apiCenterDataPlaneService.getCredential(options.input.apiName, options.input.apiVersionName, options.input.authenticationName);

            let languageModelText = "";
            const originalCredential = JSON.parse(JSON.stringify(credential));

            if (credential && credential.securityScheme) {
                let credentialValue = "";
                // Mask the credential value to avoid exposing sensitive information to LLM
                if (credential.apiKey?.value) {
                    credentialValue = credential.apiKey.value;
                    credential.apiKey.value = "******";
                } else if (credential.oauth2?.clientSecret) {
                    credentialValue = credential.oauth2.clientSecret;
                    credential.oauth2.clientSecret = "******";
                }

                if (credentialValue) {
                    await vscode.env.clipboard.writeText(credentialValue);
                    ext.outputChannel.appendLine(vscode.l10n.t(UiStrings.CredentialFor, options.input.authenticationName));
                    ext.outputChannel.appendLine(JSON.stringify(originalCredential, null, 2));

                    languageModelText = `Do let user know the credential for '${options.input.authenticationName}' has been copied to clipboard.
User could also view the full credential details in the 'Azure API Center' Output Channel.
The schema of credential (credential value is masked) is:\n${JSON.stringify(credential, null, 2)}`;
                } else {
                    languageModelText = JSON.stringify(credential, null, 2);
                }
            }

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(languageModelText)]);
        });
    }
}
