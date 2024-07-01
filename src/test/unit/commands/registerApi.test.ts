// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { registerApi } from "../../../commands/registerApi";
import * as registerStepByStep from "../../../commands/registerApiSubCommands/registerStepByStep";
import { RegisterViaCICD } from "../../../commands/registerApiSubCommands/registerViaCICD";
import { TelemetryClient } from "../../../common/telemetryClient";
import { ApisTreeItem } from "../../../tree/ApisTreeItem";

describe("registerAPI", () => {
    let sandbox = null as any;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('register API with CICD happy path', async () => {
        const showQuickPick = sandbox.stub(vscode.window, 'showQuickPick').resolves('CI/CD' as any);
        sandbox.stub(TelemetryClient, "sendEvent").resolves();
        sandbox.stub(TelemetryClient, "sendErrorEvent").resolves();
        const stubCICD = sandbox.stub(RegisterViaCICD, 'registerViaCICD').resolves();
        await registerApi({} as unknown as IActionContext, {} as unknown as ApisTreeItem);
        sandbox.assert.calledOnce(showQuickPick);
        sandbox.assert.calledOnce(stubCICD);
    });
    it('register API with StepByStep happy path', async () => {
        const showQuickPick = sandbox.stub(vscode.window, 'showQuickPick').resolves('Manual' as any);
        sandbox.stub(TelemetryClient, "sendEvent").resolves();
        sandbox.stub(TelemetryClient, "sendErrorEvent").resolves();
        const stubStepByStep = sandbox.stub(registerStepByStep, 'registerStepByStep').resolves();
        await registerApi({} as unknown as IActionContext, {} as unknown as ApisTreeItem);
        sandbox.assert.calledOnce(showQuickPick);
        sandbox.assert.calledOnce(stubStepByStep);
    });
    it('register API with cancel', async () => {
        const showQuickPick = sandbox.stub(vscode.window, 'showQuickPick').resolves(undefined);
        const telemetryClientSyb = sandbox.stub(TelemetryClient, "sendEvent").resolves();
        const stubStepByStep = sandbox.stub(registerStepByStep, 'registerStepByStep').resolves();
        const stubCICD = sandbox.stub(RegisterViaCICD, 'registerViaCICD').resolves();
        await registerApi({} as unknown as IActionContext, {} as unknown as ApisTreeItem);
        sandbox.assert.calledOnce(showQuickPick);
        sandbox.assert.notCalled(telemetryClientSyb);
        sandbox.assert.notCalled(stubStepByStep);
        sandbox.assert.notCalled(stubCICD);
    });
});
