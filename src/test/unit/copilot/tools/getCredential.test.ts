// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { createAzExtOutputChannel } from '@microsoft/vscode-azext-utils';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ApiCenterDataPlaneService } from '../../../../azure/ApiCenter/ApiCenterDataPlaneAPIs';
import { ApiCenterApiCredential } from '../../../../azure/ApiCenter/contracts';
import { GetCredentialTool } from '../../../../copilot/tools/getCredential';
import * as dataPlaneUtil from '../../../../copilot/utils/dataPlaneUtil';
import { ext } from '../../../../extensionVariables';
import { TelemetryUtils } from '../../../../utils/telemetryUtils';

describe('GetCredentialTool', () => {
    let sandbox: sinon.SinonSandbox;
    let createApiCenterDataPlaneServiceStub: sinon.SinonStub;
    let fakeApiCenterDataPlaneService: { getCredential: sinon.SinonStub };
    let callWithTelemetryStub: sinon.SinonStub;
    let outputChannelAppendLineStub: sinon.SinonStub;
    let tool: GetCredentialTool;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        fakeApiCenterDataPlaneService = {
            getCredential: sandbox.stub()
        };
        createApiCenterDataPlaneServiceStub = sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService')
            .resolves(fakeApiCenterDataPlaneService as unknown as ApiCenterDataPlaneService);
        callWithTelemetryStub = sandbox.stub(TelemetryUtils, 'callWithTelemetry').callsFake(async (_eventName, cb) => cb());
        ext.outputChannel = createAzExtOutputChannel('Azure API Center', ext.prefix);
        outputChannelAppendLineStub = sandbox.stub(ext.outputChannel, 'appendLine');
        tool = new GetCredentialTool();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should handle API key credential and copy to clipboard', async () => {
        const testCredential: ApiCenterApiCredential = {
            securityScheme: 'apiKey',
            apiKey: {
                value: 'test-api-key',
                in: 'header',
                name: 'X-API-Key'
            }
        };
        fakeApiCenterDataPlaneService.getCredential.resolves(testCredential);

        const result = await tool.invoke({
            input: {
                apiName: 'testApi',
                apiVersionName: 'v1',
                authenticationName: 'testAuth'
            }
        } as any, {} as vscode.CancellationToken);

        assert.ok(result instanceof vscode.LanguageModelToolResult);
        sinon.assert.calledOnce(createApiCenterDataPlaneServiceStub);
        sinon.assert.calledWith(fakeApiCenterDataPlaneService.getCredential, 'testApi', 'v1', 'testAuth');
        assert.strictEqual(await vscode.env.clipboard.readText(), 'test-api-key', 'Clipboard should contain the API key');
        sinon.assert.calledTwice(outputChannelAppendLineStub);

        const responseText = (result.content[0] as vscode.LanguageModelTextPart).value;
        assert.ok(responseText.includes('has been copied to clipboard'));
        assert.ok(responseText.includes('"value": "******"'));
    });

    it('should handle OAuth2 credential and copy to clipboard', async () => {
        const testCredential: ApiCenterApiCredential = {
            securityScheme: 'oauth2',
            oauth2: {
                clientSecret: 'test-client-secret'
            }
        };
        fakeApiCenterDataPlaneService.getCredential.resolves(testCredential);

        const result = await tool.invoke({
            input: {
                apiName: 'testApi',
                apiVersionName: 'v1',
                authenticationName: 'testAuth'
            }
        } as any, {} as vscode.CancellationToken);

        assert.ok(result instanceof vscode.LanguageModelToolResult);
        sinon.assert.calledOnce(createApiCenterDataPlaneServiceStub);
        sinon.assert.calledWith(fakeApiCenterDataPlaneService.getCredential, 'testApi', 'v1', 'testAuth');
        assert.strictEqual(await vscode.env.clipboard.readText(), 'test-client-secret', 'Clipboard should contain the client secret');
        sinon.assert.calledTwice(outputChannelAppendLineStub);

        const responseText = (result.content[0] as vscode.LanguageModelTextPart).value;
        assert.ok(responseText.includes('has been copied to clipboard'));
        assert.ok(responseText.includes('"clientSecret": "******"'));
    });

    it('should handle credential without sensitive information', async () => {
        const testCredential: ApiCenterApiCredential = {
            securityScheme: 'other'
        };
        fakeApiCenterDataPlaneService.getCredential.resolves(testCredential);

        const result = await tool.invoke({
            input: {
                apiName: 'testApi',
                apiVersionName: 'v1',
                authenticationName: 'testAuth'
            }
        } as any, {} as vscode.CancellationToken);

        assert.ok(result instanceof vscode.LanguageModelToolResult);
        sinon.assert.calledOnce(createApiCenterDataPlaneServiceStub);
        sinon.assert.calledWith(fakeApiCenterDataPlaneService.getCredential, 'testApi', 'v1', 'testAuth');
        sinon.assert.notCalled(outputChannelAppendLineStub);

        const content = result.content[0] as vscode.LanguageModelTextPart;
        assert.strictEqual(content.value, JSON.stringify(testCredential, null, 2));
    });

    it('should throw error when the service call fails', async () => {
        createApiCenterDataPlaneServiceStub.restore();
        sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').rejects(new Error('Test error'));

        await assert.rejects(async () => {
            await tool.invoke({
                input: {
                    apiName: 'testApi',
                    apiVersionName: 'v1',
                    authenticationName: 'testAuth'
                }
            } as any, {} as vscode.CancellationToken);
        }, new Error('Test error'));
    });
});
