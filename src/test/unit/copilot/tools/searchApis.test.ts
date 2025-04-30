// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { TelemetryClient } from '../../../../common/telemetryClient';
import { SearchApisTool } from '../../../../copilot/tools/searchApis';
import * as dataPlaneUtil from '../../../../copilot/utils/dataPlaneUtil';

describe('SearchApisTool', () => {
    let sandbox: sinon.SinonSandbox;
    let createApiCenterDataPlaneServiceStub: sinon.SinonStub;
    let fakeApiCenterDataPlaneService: any;
    let sendEventStub: sinon.SinonStub;
    let sendErrorEventStub: sinon.SinonStub;
    let tool: SearchApisTool;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        fakeApiCenterDataPlaneService = {
            getApiCenterApis: sandbox.stub().resolves({ value: [{ name: 'api1' }, { name: 'api2' }] })
        };
        createApiCenterDataPlaneServiceStub = sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').resolves(fakeApiCenterDataPlaneService);
        sendEventStub = sandbox.stub(TelemetryClient, 'sendEvent');
        sendErrorEventStub = sandbox.stub(TelemetryClient, 'sendErrorEvent');
        tool = new SearchApisTool();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return APIs as LanguageModelToolResult', async () => {
        const result = await tool.invoke({} as any, {} as any);

        assert.ok(result instanceof vscode.LanguageModelToolResult);
        const expectedContent = JSON.stringify([{ name: 'api1' }, { name: 'api2' }], null, 2);
        assert.deepStrictEqual(result.content, [new vscode.LanguageModelTextPart(expectedContent)]);
        sinon.assert.calledOnce(createApiCenterDataPlaneServiceStub);
        sinon.assert.calledOnce(fakeApiCenterDataPlaneService.getApiCenterApis);
        sinon.assert.calledTwice(sendEventStub);
    });

    it('should handle errors and return error message in LanguageModelToolResult', async () => {
        createApiCenterDataPlaneServiceStub.restore();
        sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').rejects(new Error('Test error'));

        const result = await tool.invoke({} as any, {} as any);

        assert.ok(result instanceof vscode.LanguageModelToolResult);
        assert.deepStrictEqual(result.content, [new vscode.LanguageModelTextPart('Test error')]);
        sinon.assert.calledOnce(sendEventStub);
        sinon.assert.calledOnce(sendErrorEventStub);
        sinon.assert.calledWith(sendErrorEventStub, 'lmTool.searchApis.end', sinon.match({ errorType: 'Error', errorMessage: 'Test error' }));
    });
});
