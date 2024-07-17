// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IAzExtOutputChannel, registerUIExtensionVariables } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { AzureAuthenticationSession, AzureSessionProvider, SignInStatus } from "../../../azure/azureLogin/authTypes";
import { AzureSubscriptionHelper } from "../../../azure/azureLogin/subscriptions";
import { TelemetryClient } from "../../../common/telemetryClient";
import { ext } from "../../../extensionVariables";
import { AzureAccountTreeItem } from "../../../tree/AzureAccountTreeItem";

describe("azureAccountTreeItem test cases", () => {
    let sandbox = null as any;
    let azureAccountTreeItem: AzureAccountTreeItem;
    let sessionProvider: AzureSessionProvider;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        sandbox.stub(TelemetryClient, "initialize").resolves();
        sandbox.stub(TelemetryClient, "sendEvent").returns();
        sandbox.stub(TelemetryClient, "sendErrorEvent").returns();
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
            availableTenants: [],
            selectedTenant: null,
            dispose: () => { },
            getAuthSession: async () => { return { succeeded: false, error: "test failed" }; },
            signInStatusChangeEvent: new vscode.EventEmitter<SignInStatus>().event,
        };
        azureAccountTreeItem = new AzureAccountTreeItem(sessionProvider);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("azureAccountTreeItem loadMoreChildrenImpl happy path", async () => {
        let res = await azureAccountTreeItem.loadMoreChildrenImpl();
        assert.equal(res.length, 1);
        assert.equal(res[0].label, "Loading...");
        assert.equal(res[0].contextValue, "azureCommand");
        assert.equal(res[0].id, "azureapicenterAccountLoading");
    });
    it("azureAccountTreeItem loadMoreChildrenImpl return login", async () => {
        sessionProvider.signInStatus = SignInStatus.SignedOut;
        let res = await azureAccountTreeItem.loadMoreChildrenImpl();
        assert.equal(res.length, 3);
        assert.equal(res[0].label, "Sign in to Azure...");
        assert.equal(res[0].contextValue, "azureCommand");
        assert.equal(res[0].commandId, "azure-api-center.signInToAzure");
        assert.equal(res[0].id, "azureapicenterAccountSignIn");

        assert.equal(res[1].label, "Create an Azure Account...");
        assert.equal(res[1].contextValue, "azureCommand");
        assert.equal(res[1].commandId, "azure-api-center.openUrl");
        assert.equal(res[1].id, "azureapicenterCreateAzureAccount");

        assert.equal(res[2].label, "Create an Azure for Students Account...");
        assert.equal(res[2].contextValue, "azureCommand");
        assert.equal(res[2].commandId, "azure-api-center.openUrl");
        assert.equal(res[2].id, "azureapicenterCreateAzureStudentAccount");
    });
    it("azureAccountTreeItem loadMoreChildrenImpl return tenants", async () => {
        sessionProvider.signInStatus = SignInStatus.SignedIn;
        sessionProvider.availableTenants = [{ name: "test1", id: "fake1" }, { name: "test2", id: "fake2" }];
        let res = await azureAccountTreeItem.loadMoreChildrenImpl();
        assert.equal(res.length, 1);
        assert.equal(res[0].label, "Select tenant...");
        assert.equal(res[0].contextValue, "azureCommand");
        assert.equal(res[0].id, "azureapicenterAccountSelectTenant");
    });
    it("azureAccountTreeItem loadMoreChildrenImpl return subs", async () => {
        sessionProvider.signInStatus = SignInStatus.SignedIn;
        sessionProvider.selectedTenant = { name: "test1", id: "fake1" };
        let autSession: AzureAuthenticationSession = {
            id: 'test123', accessToken: 'fake_token', account: { id: 'fake_id', label: 'fake_label' }, scopes: [], tenantId: 'fake_id'
        };
        sessionProvider.getAuthSession = async () => { return { succeeded: true, result: autSession }; };
        sandbox.stub(AzureSubscriptionHelper, "getSubscriptions").resolves({ succeeded: true, result: [] });
        let res = await azureAccountTreeItem.loadMoreChildrenImpl();
        assert.equal(res.length, 1);
        assert.equal(res[0].label, "Select Subscriptions...");
        assert.equal(res[0].contextValue, "azureCommand");
        assert.equal(res[0].id, "azureapicenterSubscription");
        assert.equal(res[0].commandId, "azure-api-center.selectSubscriptions");
    });
});
