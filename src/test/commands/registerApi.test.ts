import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { registerApi } from "../../commands/registerApi";
import * as registerViaCICD from "../../commands/registerApiSubCommands/registerViaCICD";
import { TelemetryClient } from "../../common/telemetryClient";
import { ApisTreeItem } from "../../tree/ApisTreeItem";

describe("registerAPI", () => {
    const sandbox = sinon.createSandbox();
    afterEach(() => {
        sandbox.restore();
    })
    it('register API with CICD happy path', async () => {
        const showQuickPick = sinon.stub(vscode.window, 'showQuickPick').resolves('CI/CD');
        sandbox.stub(TelemetryClient, "sendEvent").resolves();
        sandbox.stub(TelemetryClient, "sendErrorEvent").resolves();
        const stubCICD = sinon.stub(registerViaCICD, 'registerViaCICD').resolves();
        await registerApi({} as unknown as IActionContext, {} as unknown as ApisTreeItem);
        sandbox.assert.calledOnce(showQuickPick);
        sandbox.assert.calledOnce(stubCICD)
    });
});
