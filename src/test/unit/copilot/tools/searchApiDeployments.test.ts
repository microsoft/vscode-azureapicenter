// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { SearchApiDeploymentsTool } from '../../../../copilot/tools/searchApiDeployments';
import * as dataPlaneUtil from '../../../../copilot/utils/dataPlaneUtil';
import { TelemetryUtils } from '../../../../utils/telemetryUtils';

describe('SearchApiDeploymentsTool', () => {
    let sandbox: sinon.SinonSandbox;
    let createApiCenterDataPlaneServiceStub: sinon.SinonStub;
    let fakeApiCenterDataPlaneService: any;
    let callWithTelemetryStub: sinon.SinonStub;
    let tool: SearchApiDeploymentsTool;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        fakeApiCenterDataPlaneService = {
            listApiDeployments: sandbox.stub().resolves({ value: [{ name: 'deployment1' }, { name: 'deployment2' }] })
        };
        createApiCenterDataPlaneServiceStub = sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').resolves(fakeApiCenterDataPlaneService);
        callWithTelemetryStub = sandbox.stub(TelemetryUtils, 'callWithTelemetry').callsFake(async (_eventName, cb) => cb());
        tool = new SearchApiDeploymentsTool();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return API deployments as LanguageModelToolResult', async () => {
        const result = await tool.invoke({ input: { apiName: 'api1' } } as any, {} as any);

        assert.ok(result instanceof vscode.LanguageModelToolResult);
        const expectedContent = `Unless the user wants to retrieve all deployments, please select the deployment where the 'isDefault' property is true.
Here are the details of the deployments for the API 'api1':
${JSON.stringify([{ name: 'deployment1' }, { name: 'deployment2' }], null, 2)}`;
        assert.deepStrictEqual(result.content, [new vscode.LanguageModelTextPart(expectedContent)]);
        sinon.assert.calledOnce(createApiCenterDataPlaneServiceStub);
        sinon.assert.calledOnce(fakeApiCenterDataPlaneService.listApiDeployments);
        sinon.assert.calledWith(fakeApiCenterDataPlaneService.listApiDeployments, 'api1');
    });

    it('should throw error when it fails', async () => {
        createApiCenterDataPlaneServiceStub.restore();
        sandbox.stub(dataPlaneUtil, 'createApiCenterDataPlaneService').rejects(new Error('Test error'));

        await assert.rejects(async () => {
            await tool.invoke({ input: { apiName: 'api1' } } as any, {} as any);
        }, new Error('Test error'));
    });
});
