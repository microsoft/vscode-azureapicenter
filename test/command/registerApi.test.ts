import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { registerApi } from "../../src/commands/registerApi";
import { TelemetryClient } from "../../src/common/telemetryClient";
import { ApisTreeItem } from "../../src/tree/ApisTreeItem";

describe("registerApi", () => {
    const sandbox = sinon.createSandbox();
    afterEach(() => {
        sandbox.restore();
    })
    it("happy path", async () => {
        sinon.stub(TelemetryClient, "sendEvent").resolves();
        sinon.stub(TelemetryClient, "sendErrorEvent").resolves();
        sinon.stub(vscode.window, "showQuickPick").callsArgWith(1, "CI/CD").resolves();
        await registerApi({} as unknown as IActionContext, {} as unknown as ApisTreeItem);
    })
})
