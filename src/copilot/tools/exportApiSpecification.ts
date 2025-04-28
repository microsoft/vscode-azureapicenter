// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { ApiSpecExportResultFormat } from '../../azure/ApiCenter/contracts';
import { GeneralUtils } from '../../utils/generalUtils';
import { TelemetryUtils } from '../../utils/telemetryUtils';
import { createApiCenterDataPlaneService } from '../utils/dataPlaneUtil';

interface IExportApiSpecificationParameters {
    apiName: string;
    apiVersionName: string;
    apiDefinitionName: string;
}

export class ExportApiSpecificationTool implements vscode.LanguageModelTool<IExportApiSpecificationParameters> {
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<IExportApiSpecificationParameters>,
        _token: vscode.CancellationToken
    ) {
        return TelemetryUtils.callLmToolWithTelemetry('lmTool.exportApiSpecification', async () => {
            const apiCenterDataPlaneService = await createApiCenterDataPlaneService();

            const response = await apiCenterDataPlaneService.exportSpecification(options.input.apiName, options.input.apiVersionName, options.input.apiDefinitionName);

            const apiSpecificationContent = (response.format === ApiSpecExportResultFormat.link) ? await GeneralUtils.fetchDataFromLink(response.value) : response.value;

            return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(apiSpecificationContent)]);
        });
    }
}
