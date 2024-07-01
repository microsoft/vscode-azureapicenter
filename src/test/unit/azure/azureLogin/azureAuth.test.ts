// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { AzureAuthenticationSession, AzureSessionProvider, GetAuthSessionOptions, ReadyAzureSessionProvider, SignInStatus, Tenant } from "../../../../azure/azureLogin/authTypes";
import { AzureAuth } from "../../../../azure/azureLogin/azureAuth";
import { AzureSessionProviderHelper } from "../../../../azure/azureLogin/azureSessionProvider";
import { GeneralUtils } from "../../../../utils/generalUtils";
describe("azureLogin azureAuth base function", () => {
    let sandbox = null as any;
    let azureSessionProviderReady: ReadyAzureSessionProvider;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        let mockEvent = <vscode.Event<SignInStatus>>{};
        let successSession = <GeneralUtils.Succeeded<AzureAuthenticationSession>>{
            succeeded: true,
            result: {
                accessToken: "fakeToken"
            }
        };
        azureSessionProviderReady = {
            signIn: function (): Promise<void> {
                throw new Error("Function not implemented.");
            },
            signInStatus: SignInStatus.SignedIn,
            availableTenants: [],
            selectedTenant: {
                name: "123",
                id: "123"
            },
            signInStatusChangeEvent: mockEvent,
            getAuthSession: function (options?: GetAuthSessionOptions): Promise<GeneralUtils.Errorable<AzureAuthenticationSession>> {
                return Promise.resolve(successSession);
            },
            dispose: function (): void {
                throw new Error("Function not implemented.");
            },
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("getDefaultScope endpoint", async () => {
        let endpoint = "https://localhost/com";
        let res = AzureAuth.getDefaultScope(endpoint);
        assert.strictEqual(res, "https://localhost/com/.default");
        endpoint = endpoint + '/';
        res = AzureAuth.getDefaultScope(endpoint);
        assert.strictEqual(res, "https://localhost/com/.default");
    });
    it("getCredential happy path", async () => {
        const res = AzureAuth.getCredential(azureSessionProviderReady);
        const res1 = await res.getToken("test");
        assert.equal(res1?.expiresOnTimestamp, 0);
        assert.strictEqual(res1?.token, "fakeToken");
    });
    it("getCredential failed", async () => {
        let failedSession = <GeneralUtils.Failed>{
            succeeded: false,
            error: "failed"
        };
        azureSessionProviderReady.getAuthSession = function (options?: GetAuthSessionOptions | undefined): Promise<GeneralUtils.Errorable<AzureAuthenticationSession>> {
            return Promise.resolve(failedSession);
        };
        const res = AzureAuth.getCredential(azureSessionProviderReady);
        try {
            await res.getToken("test");
        } catch (err) {
            assert.strictEqual((err as Error).message, "No Microsoft authentication session found: failed");
        }
    });
    it("quickPickTenant happy path", async () => {
        const stubQiuckPick = sandbox.stub(vscode.window, "showQuickPick").resolves({ label: "abc", tenant: { name: "fakeTenant", id: "123-123-123" } });
        let tenant: Tenant[] = [];
        let res = await AzureAuth.quickPickTenant(tenant);
        sandbox.assert.calledOnce(stubQiuckPick);
        assert.ok(res);
        assert.equal(res.id, "123-123-123");
        assert.equal(res.name, "fakeTenant");
    });
    it("quickPickTenant not select", async () => {
        const stubQiuckPick = sandbox.stub(vscode.window, "showQuickPick").resolves(null);
        let tenant: Tenant[] = [];
        let res = await AzureAuth.quickPickTenant(tenant);
        sandbox.assert.calledOnce(stubQiuckPick);
        assert.equal(res, undefined);
    });
});

describe("getReadySessionProvider", () => {
    let sandbox = null as any;
    let azureSessionProvider: AzureSessionProvider;
    before(async () => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(async () => {
        let mockEvent = <vscode.Event<SignInStatus>>{};
        let successSession = <GeneralUtils.Succeeded<AzureAuthenticationSession>>{
            succeeded: true,
            result: {
                accessToken: "fakeToken"
            }
        };
        azureSessionProvider = {
            signIn: function (): Promise<void> {
                throw new Error("Function not implemented.");
            },
            signInStatus: SignInStatus.SignedIn,
            availableTenants: [],
            selectedTenant: {
                name: "123",
                id: "123"
            },
            signInStatusChangeEvent: mockEvent,
            getAuthSession: function (options?: GetAuthSessionOptions): Promise<GeneralUtils.Errorable<AzureAuthenticationSession>> {
                return Promise.resolve(successSession);
            },
            dispose: function (): void {
                throw new Error("Function not implemented.");
            },
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("getReadySessionProvider not ready", async () => {
        let fakeIsReady = sandbox.stub(AzureAuth, "isReady").returns(true);
        let getSubscriptStub = sandbox.stub(AzureSessionProviderHelper, "getSessionProvider").returns(azureSessionProvider);
        const res = await AzureAuth.getReadySessionProvider();
        sandbox.assert.calledOnce(fakeIsReady);
        sandbox.assert.calledOnce(getSubscriptStub);
        assert.equal(res.succeeded, true);
    });
    it("getReadySessionProvider ready", async () => {
        let fakeIsReady = sandbox.stub(AzureAuth, 'isReady');
        fakeIsReady.onCall(0).returns(false);
        fakeIsReady.onCall(1).returns(true);
        let getSubscriptionsStub = sandbox.stub(AzureSessionProviderHelper, "getSessionProvider").returns(azureSessionProvider);
        const res = await AzureAuth.getReadySessionProvider();
        sandbox.assert.calledOnce(getSubscriptionsStub);
        assert.equal(res.succeeded, true);
    });
    it("getReadySessionProvider failed session", async () => {
        let failedSession = <GeneralUtils.Failed>{
            succeeded: false,
            error: "failed"
        };
        azureSessionProvider.getAuthSession = function (options?: GetAuthSessionOptions | undefined): Promise<GeneralUtils.Errorable<AzureAuthenticationSession>> {
            return Promise.resolve(failedSession);
        };
        sandbox.stub(AzureAuth, 'isReady').returns(false);
        let getSubscriptionsStub = sandbox.stub(AzureSessionProviderHelper, "getSessionProvider").returns(azureSessionProvider);
        const res = await AzureAuth.getReadySessionProvider();
        sandbox.assert.calledOnce(getSubscriptionsStub);
        assert.equal(res.succeeded, false);
        assert.equal((res as GeneralUtils.Failed).error, "Failed to get authentication session: failed");
    });
});

describe("getConfiguredAzureEnv", () => {
    let sandbox = null as any;
    let workspaceConfiguration: vscode.WorkspaceConfiguration;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        workspaceConfiguration = {
            get: function <T>(section: string): T | undefined {
                throw new Error("Function not implemented.");
            },
            has: function (section: string): boolean {
                throw new Error("Function not implemented.");
            },
            inspect: function <T>(section: string): { key: string; defaultValue?: T | undefined; globalValue?: T | undefined; workspaceValue?: T | undefined; workspaceFolderValue?: T | undefined; defaultLanguageValue?: T | undefined; globalLanguageValue?: T | undefined; workspaceLanguageValue?: T | undefined; workspaceFolderLanguageValue?: T | undefined; languageIds?: string[] | undefined; } | undefined {
                throw new Error("Function not implemented.");
            },
            update: function (section: string, value: any, configurationTarget?: boolean | vscode.ConfigurationTarget | null | undefined, overrideInLanguage?: boolean | undefined): Thenable<void> {
                throw new Error("Function not implemented.");
            }
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('getConfiguredAzureEnv return azure china', async () => {
        sandbox.stub(workspaceConfiguration, "get").returns('ChinaCloud');
        sandbox.stub(vscode.workspace, "getConfiguration").returns(workspaceConfiguration);
        const res = AzureAuth.getConfiguredAzureEnv();
        assert.strictEqual(res.name, "AzureChinaCloud");
    });
    it('getConfiguredAzureEnv return USGovernment', async () => {
        sandbox.stub(workspaceConfiguration, "get").returns('USGovernment');
        sandbox.stub(vscode.workspace, "getConfiguration").returns(workspaceConfiguration);
        const res = AzureAuth.getConfiguredAzureEnv();
        assert.strictEqual(res.name, "AzureUSGovernment");
    });
    it('getConfiguredAzureEnv return USGovernment without custom cloud config', async () => {
        let stubConfigGet = sandbox.stub(workspaceConfiguration, "get");
        stubConfigGet.onCall(0).returns('custom');
        stubConfigGet.onCall(0).returns(null);
        sandbox.stub(vscode.workspace, "getConfiguration").returns(workspaceConfiguration);
        try {
            AzureAuth.getConfiguredAzureEnv();
        } catch (err) {
            assert.strictEqual((err as Error).message, "The custom cloud choice is not configured. Please configure the setting microsoft-sovereign-cloud environment");
        }
    });
});
