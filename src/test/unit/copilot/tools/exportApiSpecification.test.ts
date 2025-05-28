// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ApiSpecExportResultFormat } from '../../../../azure/ApiCenter/contracts';
import { ExportApiSpecificationTool } from '../../../../copilot/tools/exportApiSpecification';
import * as dataPlaneUtil from '../../../../copilot/utils/dataPlaneUtil';
import { GeneralUtils } from '../../../../utils/generalUtils';
import { TelemetryUtils } from '../../../../utils/telemetryUtils';

describe('ExportApiSpecificationTool', () => {
    let sandbox: sinon.SinonSandbox;
    let createApiCenterDataPlaneServiceStub: sinon.SinonStub;
    let fakeApiCenterDataPlaneService: any;
    let callWithTelemetryStub: sinon.SinonStub;
    let fetchDataFromLinkStub: sinon.SinonStub;
    let tool: ExportApiSpecificationTool;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        fakeApiCenterDataPlaneService = {
            exportSpecification: sandbox.stub().resolves({
                format: ApiSpecExportResultFormat.inline,
                value: 'test specification content'
            })
        };
        createApiCenterDataPlaneServiceStub = sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').resolves(fakeApiCenterDataPlaneService);
        callWithTelemetryStub = sandbox.stub(TelemetryUtils, 'callWithTelemetry').callsFake(async (_eventName, cb) => cb());
        fetchDataFromLinkStub = sandbox.stub(GeneralUtils, 'fetchDataFromLink').resolves('fetched specification content');
        tool = new ExportApiSpecificationTool();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return API specification content directly when format is inline', async () => {
        const result = await tool.invoke({
            input: {
                apiName: 'api1',
                apiVersionName: 'v1',
                apiDefinitionName: 'def1'
            }
        } as any, {} as any);

        assert.ok(result instanceof vscode.LanguageModelToolResult);
        assert.deepStrictEqual(result.content, [new vscode.LanguageModelTextPart('test specification content')]);
        sinon.assert.calledOnce(createApiCenterDataPlaneServiceStub);
        sinon.assert.calledWith(fakeApiCenterDataPlaneService.exportSpecification, 'api1', 'v1', 'def1');
        sinon.assert.notCalled(fetchDataFromLinkStub);
    });

    it('should fetch and return API specification content when format is link', async () => {
        fakeApiCenterDataPlaneService.exportSpecification.resolves({
            format: ApiSpecExportResultFormat.link,
            value: 'http://test-url'
        });

        const result = await tool.invoke({
            input: {
                apiName: 'api1',
                apiVersionName: 'v1',
                apiDefinitionName: 'def1'
            }
        } as any, {} as any);

        assert.ok(result instanceof vscode.LanguageModelToolResult);
        assert.deepStrictEqual(result.content, [new vscode.LanguageModelTextPart('fetched specification content')]);
        sinon.assert.calledOnce(createApiCenterDataPlaneServiceStub);
        sinon.assert.calledWith(fakeApiCenterDataPlaneService.exportSpecification, 'api1', 'v1', 'def1');
        sinon.assert.calledWith(fetchDataFromLinkStub, 'http://test-url');
    });

    it('should throw error when data plane service creation fails', async () => {
        createApiCenterDataPlaneServiceStub.restore();
        sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').rejects(new Error('Test error'));

        await assert.rejects(async () => {
            await tool.invoke({
                input: {
                    apiName: 'api1',
                    apiVersionName: 'v1',
                    apiDefinitionName: 'def1'
                }
            } as any, {} as any);
        }, new Error('Test error'));
    });
});
