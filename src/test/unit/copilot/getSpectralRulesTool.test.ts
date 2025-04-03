// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as sinon from "sinon";
import * as vscode from 'vscode';
import { TelemetryClient } from "../../../common/telemetryClient";
import { TelemetryEvent } from "../../../common/telemetryEvent";
import { GenerateOpenApi } from "../../../copilot/generateOpenApi";
import { GetSpectralRulesTool } from "../../../copilot/getSpectralRulesTool";
import assert = require("assert");

describe('GetSpectralRulesTool', () => {
    let sandbox: sinon.SinonSandbox;
    let getSpectralRulesTool: GetSpectralRulesTool;
    let sendEventStub: sinon.SinonStub;
    let getRulesetFileStub: sinon.SinonStub;
    let getRuleDescriptionsStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        getSpectralRulesTool = new GetSpectralRulesTool();
        sendEventStub = sandbox.stub(TelemetryClient, 'sendEvent');
        getRulesetFileStub = sandbox.stub(GenerateOpenApi, 'getRulesetFile').returns('mockRulesetFile');
        getRuleDescriptionsStub = sandbox.stub(GenerateOpenApi, 'getRuleDescriptions').resolves('mockRuleDescriptions');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should send telemetry event and return rule descriptions', async () => {
        const result = await getSpectralRulesTool.invoke({
            toolInvocationToken: undefined,
            input: undefined
        }, {} as vscode.CancellationToken);

        sinon.assert.calledOnceWithExactly(sendEventStub, TelemetryEvent.getSpectralRulesToolInvoke);
        sinon.assert.calledOnce(getRulesetFileStub);
        sinon.assert.calledOnceWithExactly(getRuleDescriptionsStub, 'mockRulesetFile');
    });

    it('should handle errors gracefully when getRuleDescriptions fails', async () => {
        getRuleDescriptionsStub.rejects(new Error('Failed to get rule descriptions'));
        await assert.rejects(
            getSpectralRulesTool.invoke({
                toolInvocationToken: undefined,
                input: undefined
            }, {} as vscode.CancellationToken),
            { message: 'Failed to get rule descriptions' }
        );
        sinon.assert.calledOnceWithExactly(sendEventStub, TelemetryEvent.getSpectralRulesToolInvoke);
        sinon.assert.calledOnce(getRulesetFileStub);
    });
});
