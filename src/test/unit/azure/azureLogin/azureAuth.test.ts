// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { AzureAuthenticationSession, AzureSessionProvider, GetAuthSessionOptions, ReadyAzureSessionProvider, SignInStatus, Tenant } from "../../../../azure/azureLogin/authTypes";
import { AzureAuth } from "../../../../azure/azureLogin/azureAuth";
import { AzureSessionProviderHelper } from "../../../../azure/azureLogin/azureSessionProvider";
import { Utils } from "../../../../utils/utils";
describe("azureLogin azureAuth base function", () => {
    let sandbox = null as any;
    let azureSessionProviderReady: ReadyAzureSessionProvider;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        let mockEvent = <vscode.Event<SignInStatus>>{};
        let successSession = <Utils.Succeeded<AzureAuthenticationSession>>{
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
            getAuthSession: function (options?: GetAuthSessionOptions): Promise<Utils.Errorable<AzureAuthenticationSession>> {
                return Promise.resolve(successSession);
            },
            dispose: function (): void {
                throw new Error("Function not implemented.");
            },
        }
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
        let failedSession = <Utils.Failed>{
            succeeded: false,
            error: "failed"
        };
        azureSessionProviderReady.getAuthSession = function (options?: GetAuthSessionOptions | undefined): Promise<Utils.Errorable<AzureAuthenticationSession>> {
            return Promise.resolve(failedSession);
        }
        const res = AzureAuth.getCredential(azureSessionProviderReady);
        try {
            await res.getToken("test");
        } catch (err) {
            assert.strictEqual((err as Error).message, "No Microsoft authentication session found: failed")
        }
    });
    it("quickPickTenant happy path", async () => {
        const stubQiuckPick = sandbox.stub(vscode.window, "showQuickPick").resolves({ label: "abc", tenant: { name: "fakeTenant", id: "123-123-123" } });
        let tenant: Tenant[] = []
        let res = await AzureAuth.quickPickTenant(tenant);
        sandbox.assert.calledOnce(stubQiuckPick);
        assert.ok(res);
        assert.equal(res.id, "123-123-123");
        assert.equal(res.name, "fakeTenant");
    });
    it("quickPickTenant not select", async () => {
        const stubQiuckPick = sandbox.stub(vscode.window, "showQuickPick").resolves(null);
        let tenant: Tenant[] = []
        let res = await AzureAuth.quickPickTenant(tenant);
        sandbox.assert.calledOnce(stubQiuckPick);
        assert.equal(res, undefined);
    });
});

describe("test", async () => {
    let sandbox = null as any;
    let azureSessionProvider: AzureSessionProvider;
    before(async () => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(async () => {
        let mockEvent = <vscode.Event<SignInStatus>>{};
        let successSession = <Utils.Succeeded<AzureAuthenticationSession>>{
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
            getAuthSession: function (options?: GetAuthSessionOptions): Promise<Utils.Errorable<AzureAuthenticationSession>> {
                return Promise.resolve(successSession);
            },
            dispose: function (): void {
                throw new Error("Function not implemented.");
            },
        }
    });
    afterEach(() => {
        sandbox.restore();
    })
    it("getReadySessionProvider not ready", async () => {
        let fakeIsReady = sandbox.stub(AzureAuth, "isReady").returns(true)
        let getSubscriptStub = sandbox.stub(AzureSessionProviderHelper, "getSessionProvider").returns(azureSessionProvider);
        const res = await AzureAuth.getReadySessionProvider();
        sandbox.assert.calledOnce(fakeIsReady)
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
        let failedSession = <Utils.Failed>{
            succeeded: false,
            error: "failed"
        };
        azureSessionProvider.getAuthSession = function (options?: GetAuthSessionOptions | undefined): Promise<Utils.Errorable<AzureAuthenticationSession>> {
            return Promise.resolve(failedSession);
        }
        sandbox.stub(AzureAuth, 'isReady').returns(false);
        let getSubscriptionsStub = sandbox.stub(AzureSessionProviderHelper, "getSessionProvider").returns(azureSessionProvider);
        const res = await AzureAuth.getReadySessionProvider();
        sandbox.assert.calledOnce(getSubscriptionsStub);
        assert.equal(res.succeeded, false);
        assert.equal((res as Utils.Failed).error, "Failed to get authentication session: failed");
    })
})
