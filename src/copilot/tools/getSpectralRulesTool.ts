// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { TelemetryUtils } from '../../utils/telemetryUtils';
import { GenerateOpenApi } from '../generateOpenApi';

export class GetSpectralRulesTool implements vscode.LanguageModelTool<void> {
    async invoke(
        _options: vscode.LanguageModelToolInvocationOptions<void>,
        _token: vscode.CancellationToken
    ) {
        return TelemetryUtils.callWithTelemetry<vscode.LanguageModelToolResult>('lmTool.getSpectralRules', async () => {
            const rulesetFile = GenerateOpenApi.getRulesetFile();
            const ruleDescriptions = await GenerateOpenApi.getRuleDescriptions(rulesetFile);

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(ruleDescriptions)]);
        });
    }
}
