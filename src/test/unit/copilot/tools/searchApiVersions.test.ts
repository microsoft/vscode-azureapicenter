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
    let callLmWithTelemetryStub: sinon.SinonStub;
    let tool: SearchApiVersionsTool;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        fakeApiCenterDataPlaneService = {
            getAPiCenterApiVersions: sandbox.stub().resolves({ value: [{ version: 'v1' }, { version: 'v2' }] })
        };
        createApiCenterDataPlaneServiceStub = sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').resolves(fakeApiCenterDataPlaneService);
        callLmWithTelemetryStub = sandbox.stub(TelemetryUtils, 'callWithTelemetry').callsFake(async (_eventName, cb) => cb());
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

    it('should handle errors and return error message in LanguageModelToolResult', async () => {
        createApiCenterDataPlaneServiceStub.restore();
        sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').rejects(new Error('Test error'));
        callLmWithTelemetryStub.restore();
        sandbox.stub(TelemetryUtils, 'callWithTelemetry').callsFake(async (_eventName, cb) => {
            try {
                return await cb();
            } catch (err: any) {
                return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(err.message)]);
            }
        });
        tool = new SearchApiVersionsTool();
        const result = await tool.invoke({ input: { apiName: 'api1' } } as any, {} as any);
        assert.ok(result instanceof vscode.LanguageModelToolResult);
        assert.deepStrictEqual(result.content, [new vscode.LanguageModelTextPart('Test error')]);
    });
});
