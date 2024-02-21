import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { registerApi } from "../../src/commands/registerApi";
import * as registerViaCICD from "../../src/commands/registerApiSubCommands/registerViaCICD";
import { TelemetryClient } from "../../src/common/telemetryClient";
import { ApisTreeItem } from "../../src/tree/ApisTreeItem";

describe("registerApi", () => {
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
        sandbox.restore();
    })
    afterEach(() => {
        sandbox.restore();
    })
    it("happy path", async () => {
        sandbox.stub(TelemetryClient, "sendEvent").resolves();
        sandbox.stub(TelemetryClient, "sendErrorEvent").resolves();
        const showQuickPick = sandbox.stub(vscode.window, "showQuickPick").resolves("CI/CD");
        const stubCICD = sandbox.stub(registerViaCICD, "registerViaCICD");
        await registerApi({} as unknown as IActionContext, {} as unknown as ApisTreeItem);
        sandbox.assert.calledOnce(showQuickPick);
        sandbox.assert.calledOnce(stubCICD)
    })
})
