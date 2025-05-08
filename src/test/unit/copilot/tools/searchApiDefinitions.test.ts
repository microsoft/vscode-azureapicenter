// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { SearchApiDefinitionsTool } from '../../../../copilot/tools/searchApiDefinitions';
import * as dataPlaneUtil from '../../../../copilot/utils/dataPlaneUtil';
import { TelemetryUtils } from '../../../../utils/telemetryUtils';

describe('SearchApiDefinitionsTool', () => {
    let sandbox: sinon.SinonSandbox;
    let createApiCenterDataPlaneServiceStub: sinon.SinonStub;
    let fakeApiCenterDataPlaneService: any;
    let callLWithTelemetryStub: sinon.SinonStub;
    let tool: SearchApiDefinitionsTool;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        fakeApiCenterDataPlaneService = {
            getApiCenterApiDefinitions: sandbox.stub().resolves({ value: [{ id: 'def1' }, { id: 'def2' }] })
        };
        createApiCenterDataPlaneServiceStub = sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').resolves(fakeApiCenterDataPlaneService);
        callLWithTelemetryStub = sandbox.stub(TelemetryUtils, 'callWithTelemetry').callsFake(async (_eventName, cb) => cb());
        tool = new SearchApiDefinitionsTool();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return API definitions as LanguageModelToolResult', async () => {
        const result = await tool.invoke({ input: { apiName: 'api1', apiVersionName: 'v1' } } as any, {} as any);
        assert.ok(result instanceof vscode.LanguageModelToolResult);
        const expectedContent = JSON.stringify([{ id: 'def1' }, { id: 'def2' }], null, 2);
        assert.deepStrictEqual(result.content, [new vscode.LanguageModelTextPart(expectedContent)]);
        sinon.assert.calledOnce(createApiCenterDataPlaneServiceStub);
        sinon.assert.calledOnce(fakeApiCenterDataPlaneService.getApiCenterApiDefinitions);
        sinon.assert.calledWith(fakeApiCenterDataPlaneService.getApiCenterApiDefinitions, 'api1', 'v1');
    });

    it('should throw error when it fails', async () => {
        createApiCenterDataPlaneServiceStub.restore();
        sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').rejects(new Error('Test error'));

        await assert.rejects(async () => {
            await tool.invoke({ input: { apiName: 'api1', apiVersionName: 'v1' } } as any, {} as any);
        }, new Error('Test error'));
    });
});
