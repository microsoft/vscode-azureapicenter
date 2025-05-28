// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { SearchAuthenticationTool } from '../../../../copilot/tools/searchAuthentication';
import * as dataPlaneUtil from '../../../../copilot/utils/dataPlaneUtil';
import { TelemetryUtils } from '../../../../utils/telemetryUtils';

describe('SearchAuthenticationTool', () => {
    let sandbox: sinon.SinonSandbox;
    let createApiCenterDataPlaneServiceStub: sinon.SinonStub;
    let fakeApiCenterDataPlaneService: any;
    let callLWithTelemetryStub: sinon.SinonStub;
    let tool: SearchAuthenticationTool;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        fakeApiCenterDataPlaneService = {
            listAuthentication: sandbox.stub().resolves({ value: [{ type: 'oauth2' }, { type: 'apiKey' }] })
        };
        createApiCenterDataPlaneServiceStub = sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').resolves(fakeApiCenterDataPlaneService);
        callLWithTelemetryStub = sandbox.stub(TelemetryUtils, 'callWithTelemetry').callsFake(async (_eventName, cb) => cb());
        tool = new SearchAuthenticationTool();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return authentication methods as LanguageModelToolResult', async () => {
        const result = await tool.invoke({
            input: {
                apiName: 'api1',
                apiVersionName: 'v1'
            }
        } as any, {} as any);

        assert.ok(result instanceof vscode.LanguageModelToolResult);
        const expectedContent = JSON.stringify([{ type: 'oauth2' }, { type: 'apiKey' }], null, 2);
        assert.deepStrictEqual(result.content, [new vscode.LanguageModelTextPart(expectedContent)]);
        sinon.assert.calledOnce(createApiCenterDataPlaneServiceStub);
        sinon.assert.calledWith(fakeApiCenterDataPlaneService.listAuthentication, 'api1', 'v1');
    });

    it('should throw error when it fails', async () => {
        createApiCenterDataPlaneServiceStub.restore();
        sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').rejects(new Error('Test error'));

        await assert.rejects(async () => {
            await tool.invoke({
                input: {
                    apiName: 'api1',
                    apiVersionName: 'v1'
                }
            } as any, {} as any);
        }, new Error('Test error'));
    });
});
