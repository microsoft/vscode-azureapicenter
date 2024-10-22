// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext, IAzExtOutputChannel, ISubscriptionContext, registerUIExtensionVariables } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { AzureAuthenticationSession, AzureDataSessionProvider, SignInStatus } from "../../../azure/azureLogin/authTypes";
import { AzureAuth } from "../../../azure/azureLogin/azureAuth";
import { AzureDataSessionProviderHelper } from "../../../azure/azureLogin/dataSessionProvider";
import { TelemetryClient } from "../../../common/telemetryClient";
import { ext } from "../../../extensionVariables";
import { ApiServerItem, DataPlanAccountManagerTreeItem } from "../../../tree/DataPlaneAccount";
describe("ApiServerItem treeItem test case", () => {
    let sandbox = null as any;
    let sessionProvider: AzureDataSessionProvider;
    let subContext: ISubscriptionContext;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        const credentials = AzureAuth.getDataPlaneCredential("fakeClientId", "fakeTenantId");
        const environment = AzureAuth.getEnvironment();
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
        subContext = {
            credentials,
            subscriptionDisplayName: "",
            subscriptionId: "",
            subscriptionPath: "fake_test_domain",
            tenantId: "fake_tenant_id",
            userId: "fake_client_id",
            environment,
            isCustomCloud: environment.name === "AzureCustomCloud",
        };
        sandbox.stub(TelemetryClient, "sendEvent").returns();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("DataPlanAccountManagerTreeItem return catalog wiki", async () => {
        ext.dataPlaneAccounts = [];
        sandbox.stub(AzureDataSessionProviderHelper, "getSessionProvider").returns(sessionProvider);
        const node: DataPlanAccountManagerTreeItem = new DataPlanAccountManagerTreeItem(sessionProvider);
        const res = await node.loadMoreChildrenImpl(true, {} as IActionContext);
        assert.equal(res.length, 1);
        assert.equal(res[0].commandId, "azure-api-center.apiCenterWorkspace.learnApiCatalog");
        assert.equal(res[0].id, "azureapicentercatalogwiki");
    });
    it("ApiServerItem loadmorechild return login", async () => {
        sandbox.stub(AzureDataSessionProviderHelper, "getSessionProvider").returns(sessionProvider);
        const node: ApiServerItem = new ApiServerItem(new DataPlanAccountManagerTreeItem(sessionProvider), subContext);
        const res = await node.loadMoreChildrenImpl(true, {} as IActionContext);
        assert.equal(res.length, 1);
        assert.equal(res[0].commandId, "azure-api-center.apiCenterWorkspace.signInToDataPlane");
    });
    it("ApiServerItem loadmorechild return item", async () => {
        sandbox.stub(AzureDataSessionProviderHelper, "getSessionProvider").returns(sessionProvider);
        let autSession: AzureAuthenticationSession = {
            id: 'test123', accessToken: 'fake_token', account: { id: 'fake_id', label: 'fake_label' }, scopes: [], tenantId: 'fake_id'
        };
        sessionProvider.getAuthSession = async () => { return { succeeded: true, result: autSession }; };
        const node: ApiServerItem = new ApiServerItem(new DataPlanAccountManagerTreeItem(sessionProvider), subContext);
        const res = await node.loadMoreChildrenImpl(true, {} as IActionContext);
        assert.equal(res.length, 1);
        console.log(res[0].contextValue, "azureApiCenterApis");
    });
});
