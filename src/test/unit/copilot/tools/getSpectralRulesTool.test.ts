// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { GenerateOpenApi } from '../../../../copilot/generateOpenApi';
import { GetSpectralRulesTool } from '../../../../copilot/tools/getSpectralRulesTool';
import { TelemetryUtils } from '../../../../utils/telemetryUtils';

describe('GetSpectralRulesTool', () => {
    let sandbox: sinon.SinonSandbox;
    let getRulesetFileStub: sinon.SinonStub;
    let getRuleDescriptionsStub: sinon.SinonStub;
    let callWithTelemetryStub: sinon.SinonStub;
    let tool: GetSpectralRulesTool;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        getRulesetFileStub = sandbox.stub(GenerateOpenApi, 'getRulesetFile').returns('path/to/ruleset.yml');
        getRuleDescriptionsStub = sandbox.stub(GenerateOpenApi, 'getRuleDescriptions').resolves('Rule descriptions');
        callWithTelemetryStub = sandbox.stub(TelemetryUtils, 'callWithTelemetry').callsFake(async (_eventName, cb) => cb());
        tool = new GetSpectralRulesTool();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return spectral rules as LanguageModelToolResult', async () => {
        const result = await tool.invoke({} as any, {} as any);
        assert.ok(result instanceof vscode.LanguageModelToolResult);
        assert.deepStrictEqual(result.content, [new vscode.LanguageModelTextPart('Rule descriptions')]);
        sinon.assert.calledOnce(getRulesetFileStub);
        sinon.assert.calledOnce(getRuleDescriptionsStub);
        sinon.assert.calledWith(getRuleDescriptionsStub, 'path/to/ruleset.yml');
    });

    it('should throw error when getRuleDescriptions fails', async () => {
        getRuleDescriptionsStub.rejects(new Error('Test error'));

        await assert.rejects(async () => {
            await tool.invoke({} as any, {} as any);
        }, new Error('Test error'));
    });
});
