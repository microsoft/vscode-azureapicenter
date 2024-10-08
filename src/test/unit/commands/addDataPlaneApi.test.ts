// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext, IAzExtOutputChannel, UserCancelledError, registerUIExtensionVariables } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from 'vscode';
import { AzureDataSessionProvider, SignInStatus } from "../../../azure/azureLogin/authTypes";
import { ConnectDataPlaneApi } from '../../../commands/addDataPlaneApis';
import { TelemetryClient } from "../../../common/telemetryClient";
import { DataPlaneApiFromType } from "../../../common/telemetryEvent";
import { ext } from "../../../extensionVariables";
import { DataPlanAccountManagerTreeItem } from "../../../tree/DataPlaneAccount";
describe('getDataPlaneApis test happy path', () => {
    let sandbox = null as any;
    let sessionProvider: AzureDataSessionProvider;
    let node: DataPlanAccountManagerTreeItem;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        sinon.restore();
        function gloablStateKeys(): readonly string[] {
            return ["PrereleaseState.Version"];
        }
        function globalStateGet(key: string): string {
            return "0.0.0";
        }
        function globalStateUpdate(key: string, value: any): any { }
        const mockGlobalState: vscode.Memento = {
            keys: gloablStateKeys,
            get: globalStateGet,
            update: globalStateUpdate,
        };
        ext.context = {
            subscriptions: [],
            globalState: mockGlobalState,
            extension: {
                packageJSON: {
                    name: "azure-api-center",
                    publisher: "apidev",
                    displayName: "Azure API Center",
                    description: "Build, discover, and consume APIs.",
                    version: "1.0.0",
                    bugsUrl: "https://fake_url",
                    aiKey: "fake_Aikey"
                }
            }
        } as unknown as vscode.ExtensionContext;
        ext.outputChannel = {
            appendLog: () => { },
            show: () => { },
            info: () => { },
        } as unknown as IAzExtOutputChannel;
        registerUIExtensionVariables(ext);
        sessionProvider = {
            signIn: async () => { },
            signInStatus: SignInStatus.Initializing,
            dispose: () => { },
            getAuthSession: async () => {
                return { succeeded: false, error: "test failed" };
            },
            signInStatusChangeEvent: new vscode.EventEmitter<SignInStatus>().event,
        };
        node = new DataPlanAccountManagerTreeItem(sessionProvider);
        ext.dataPlaneTreeItem = node;
        sandbox.stub(node, "refresh").resolves();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("sendDataPlaneApiTelemetry happy path", async () => {
        let sendEventStub = sandbox.stub(TelemetryClient, "sendEvent").returns();
        ConnectDataPlaneApi.sendDataPlaneApiTelemetry("fakeRuntimeUrl", "fakeClientId", "fakeTenantId", DataPlaneApiFromType.dataPlaneApiAddFromInput);
        sandbox.assert.calledOnce(sendEventStub);
        assert.equal(sendEventStub.getCall(0).args[0], "dataPlane.addApiInstance");
        assert.equal(sendEventStub.getCall(0).args[1].dataPlaneRuntimeUrl, "fakeRuntimeUrl");
        assert.equal(sendEventStub.getCall(0).args[1].dataPlaneTenantId, "fakeTenantId");
        assert.equal(sendEventStub.getCall(0).args[1].dataPlaneClientId, "fakeClientId");
        assert.equal(sendEventStub.getCall(0).args[1].dataPlaneApiAddSource, "dataPlaneApiAddFromInput");
    });
    it("addDataPlaneApis happy path", async () => {
        sandbox.stub(ConnectDataPlaneApi, "sendDataPlaneApiTelemetry").returns();
        let spy = sandbox.stub(ConnectDataPlaneApi, "setAccountToExt").returns();
        let sendEventStub = sandbox.stub(vscode.window, "showInputBox");
        sendEventStub.onFirstCall().resolves("https://fakeUrl.com");
        sendEventStub.onSecondCall().resolves("fakeClientId");
        sendEventStub.onThirdCall().resolves("fakeTenantId");
        await ConnectDataPlaneApi.addDataPlaneApis({} as IActionContext);
        sandbox.assert.calledOnce(spy);
        assert.equal(spy.getCall(0).args[0], "https://fakeUrl.com");
        assert.equal(spy.getCall(0).args[1], "fakeClientId");
        assert.equal(spy.getCall(0).args[2], "fakeTenantId");
    });
    it("addDataPlaneApis with user cancelled 1", async () => {
        let sendEventStub = sandbox.stub(vscode.window, "showInputBox");
        sendEventStub.onFirstCall().resolves(undefined);
        try {
            await ConnectDataPlaneApi.addDataPlaneApis({} as IActionContext);
        } catch (error) {
            assert.equal(error instanceof UserCancelledError, true);
        }
    });
    it("addDataPlaneApis with user cancelled 2", async () => {
        let sendEventStub = sandbox.stub(vscode.window, "showInputBox");
        sendEventStub.onFirstCall().resolves("https://fakeUrl.com");
        sendEventStub.onSecondCall().resolves(undefined);
        try {
            await ConnectDataPlaneApi.addDataPlaneApis({} as IActionContext);
        } catch (error) {
            assert.equal(error instanceof UserCancelledError, true);
        }
    });
    it("addDataPlaneApis with user cancelled 3", async () => {
        let sendEventStub = sandbox.stub(vscode.window, "showInputBox");
        sendEventStub.onFirstCall().resolves("https://fakeUrl.com");
        sendEventStub.onSecondCall().resolves("fakeClientId");
        sendEventStub.onThirdCall().resolves(undefined);
        try {
            await ConnectDataPlaneApi.addDataPlaneApis({} as IActionContext);
        } catch (error) {
            assert.equal(error instanceof UserCancelledError, true);
        }
    });
});
