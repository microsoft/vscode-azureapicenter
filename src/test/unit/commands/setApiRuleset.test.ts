// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as sinon from "sinon";
import * as vscode from "vscode";
import { SetApiRuleset } from "../../../commands/setApiRuleset";
import { TelemetryClient } from "../../../common/telemetryClient";
import { ApiRulesetOptions, azureApiGuidelineRulesetFile, defaultRulesetFile, spectralOwaspRulesetFile } from "../../../constants";
import { EnsureExtension } from "../../../utils/ensureExtension";
import { SetRulesetFile } from "../../../utils/ruleUtils";

describe("setApiRuleset", () => {
    let sandbox: sinon.SinonSandbox;
    let showQuickPickStub: sinon.SinonStub;
    let showOpenDialogStub: sinon.SinonStub;
    let showInputBoxStub: sinon.SinonStub;
    let sendEventStub: sinon.SinonStub;
    let setRulesetFileStub: sinon.SinonStub;
    let ensureExtensionStub: sinon.SinonStub;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        showQuickPickStub = sandbox.stub(vscode.window, "showQuickPick");
        showOpenDialogStub = sandbox.stub(vscode.window, "showOpenDialog");
        showInputBoxStub = sandbox.stub(vscode.window, "showInputBox");
        sendEventStub = sandbox.stub(TelemetryClient, "sendEvent");
        setRulesetFileStub = sandbox.stub(SetRulesetFile, "setRulesetFile");
        ensureExtensionStub = sandbox.stub(EnsureExtension, "ensureExtension");
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should set default ruleset file", async () => {
        showQuickPickStub.resolves(ApiRulesetOptions.default);

        await SetApiRuleset.setApiRuleset({} as any);

        sinon.assert.calledOnceWithExactly(setRulesetFileStub, defaultRulesetFile);
        sinon.assert.calledOnceWithExactly(sendEventStub, "setApiRuleset.selectOption", { option: ApiRulesetOptions.default });
    });

    it("should set azure API guideline ruleset file", async () => {
        showQuickPickStub.resolves(ApiRulesetOptions.azureApiGuideline);

        await SetApiRuleset.setApiRuleset({} as any);

        sinon.assert.calledOnceWithExactly(setRulesetFileStub, azureApiGuidelineRulesetFile);
        sinon.assert.calledOnceWithExactly(sendEventStub, "setApiRuleset.selectOption", { option: ApiRulesetOptions.azureApiGuideline });
    });

    it("should set spectral OWASP ruleset file", async () => {
        showQuickPickStub.resolves(ApiRulesetOptions.spectralOwasp);

        await SetApiRuleset.setApiRuleset({} as any);

        sinon.assert.calledOnceWithExactly(setRulesetFileStub, spectralOwaspRulesetFile);
        sinon.assert.calledOnceWithExactly(sendEventStub, "setApiRuleset.selectOption", { option: ApiRulesetOptions.spectralOwasp });
    });

    it("should set active file as ruleset file", async () => {
        const activeEditorStub = sandbox.stub(vscode.window, "activeTextEditor").get(() => ({
            document: { uri: { fsPath: "activeFilePath" } }
        }));

        showQuickPickStub.resolves(ApiRulesetOptions.activeFile);

        await SetApiRuleset.setApiRuleset({} as any);

        sinon.assert.calledOnceWithExactly(setRulesetFileStub, "activeFilePath");
        sinon.assert.calledOnceWithExactly(sendEventStub, "setApiRuleset.selectOption", { option: ApiRulesetOptions.activeFile });
    });

    it("should set selected file as ruleset file", async () => {
        showQuickPickStub.resolves(ApiRulesetOptions.selectFile);
        showOpenDialogStub.resolves([{ fsPath: "selectedFilePath" }]);

        await SetApiRuleset.setApiRuleset({} as any);

        sinon.assert.calledOnceWithExactly(setRulesetFileStub, "selectedFilePath");
        sinon.assert.calledOnceWithExactly(sendEventStub, "setApiRuleset.selectOption", { option: ApiRulesetOptions.selectFile });
    });

    it("should set input URL as ruleset file", async () => {
        showQuickPickStub.resolves(ApiRulesetOptions.inputUrl);
        showInputBoxStub.resolves("http://example.com/ruleset.json");

        await SetApiRuleset.setApiRuleset({} as any);

        sinon.assert.calledOnceWithExactly(setRulesetFileStub, "http://example.com/ruleset.json");
        sinon.assert.calledOnceWithExactly(sendEventStub, "setApiRuleset.selectOption", { option: ApiRulesetOptions.inputUrl });
    });

    it("should set no ruleset file", async () => {
        showQuickPickStub.resolves(ApiRulesetOptions.none);

        await SetApiRuleset.setApiRuleset({} as any);

        sinon.assert.calledOnceWithExactly(setRulesetFileStub, "");
        sinon.assert.calledOnceWithExactly(sendEventStub, "setApiRuleset.selectOption", { option: ApiRulesetOptions.none });
    });
});
