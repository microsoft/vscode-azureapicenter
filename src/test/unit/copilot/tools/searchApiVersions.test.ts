// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { SearchApiVersionsTool } from '../../../../copilot/tools/searchApiVersions';
import * as dataPlaneUtil from '../../../../copilot/utils/dataPlaneUtil';
import { TelemetryUtils } from '../../../../utils/telemetryUtils';

describe('SearchApiVersionsTool', () => {
    let sandbox: sinon.SinonSandbox;
    let createApiCenterDataPlaneServiceStub: sinon.SinonStub;
    let fakeApiCenterDataPlaneService: any;
    let callLWithTelemetryStub: sinon.SinonStub;
    let tool: SearchApiVersionsTool;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        fakeApiCenterDataPlaneService = {
            getAPiCenterApiVersions: sandbox.stub().resolves({ value: [{ version: 'v1' }, { version: 'v2' }] })
        };
        createApiCenterDataPlaneServiceStub = sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').resolves(fakeApiCenterDataPlaneService);
        callLWithTelemetryStub = sandbox.stub(TelemetryUtils, 'callWithTelemetry').callsFake(async (_eventName, cb) => cb());
        tool = new SearchApiVersionsTool();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return API versions as LanguageModelToolResult', async () => {
        const result = await tool.invoke({ input: { apiName: 'api1' } } as any, {} as any);
        assert.ok(result instanceof vscode.LanguageModelToolResult);
        const expectedContent = JSON.stringify([{ version: 'v1' }, { version: 'v2' }], null, 2);
        assert.deepStrictEqual(result.content, [new vscode.LanguageModelTextPart(expectedContent)]);
        sinon.assert.calledOnce(createApiCenterDataPlaneServiceStub);
        sinon.assert.calledOnce(fakeApiCenterDataPlaneService.getAPiCenterApiVersions);
    });

    it('should throw error when it fails', async () => {
        createApiCenterDataPlaneServiceStub.restore();
        sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').rejects(new Error('Test error'));

        await assert.rejects(async () => {
            await tool.invoke({ input: { apiName: 'api1' } } as any, {} as any);
        }, new Error('Test error'));
    });
});
