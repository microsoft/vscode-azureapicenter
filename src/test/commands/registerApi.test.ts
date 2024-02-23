import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { registerApi } from "../../commands/registerApi";
import * as registerStepByStep from "../../commands/registerApiSubCommands/registerStepByStep";
import * as registerViaCICD from "../../commands/registerApiSubCommands/registerViaCICD";
import { TelemetryClient } from "../../common/telemetryClient";
import { ApisTreeItem } from "../../tree/ApisTreeItem";

describe("registerAPI", () => {
    const sandbox = sinon.createSandbox();
    afterEach(() => {
        sandbox.restore();
    });
    it('register API with CICD happy path', async () => {
        const showQuickPick = sandbox.stub(vscode.window, 'showQuickPick').resolves('CI/CD' as any);
        sandbox.stub(TelemetryClient, "sendEvent").resolves();
        sandbox.stub(TelemetryClient, "sendErrorEvent").resolves();
        const stubCICD = sandbox.stub(registerViaCICD, 'registerViaCICD').resolves();
        await registerApi({} as unknown as IActionContext, {} as unknown as ApisTreeItem);
        sandbox.assert.calledOnce(showQuickPick);
        sandbox.assert.calledOnce(stubCICD);
    });
    it('register API with StepByStep happy path', async () => {
        const showQuickPick = sandbox.stub(vscode.window, 'showQuickPick').resolves('Step by step' as any);
        sandbox.stub(TelemetryClient, "sendEvent").resolves();
        sandbox.stub(TelemetryClient, "sendErrorEvent").resolves();
        const stubStepByStep = sandbox.stub(registerStepByStep, 'registerStepByStep').resolves();
        await registerApi({} as unknown as IActionContext, {} as unknown as ApisTreeItem);
        sandbox.assert.calledOnce(showQuickPick);
        sandbox.assert.calledOnce(stubStepByStep);
    });
});
