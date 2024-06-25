// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { AzureAuthenticationSession, GetAuthSessionOptions, ReadyAzureSessionProvider, SignInStatus } from "../../../../azure/azureLogin/authTypes";
import { AzureAuth } from "../../../../azure/azureLogin/azureAuth";
import { Utils } from "../../../../utils/utils";
suite("azureLogin azureAuth File", () => {
    let sandbox = null as any;
    suiteSetup(() => {
        sandbox = sinon.createSandbox();
    });
    teardown(() => {
        sandbox.restore();
    });
    test("getDefaultScope endpoint", async () => {
        let endpoint = "https://localhost/com";
        let res = AzureAuth.getDefaultScope(endpoint);
        assert.strictEqual(res, "https://localhost/com/.default");
        endpoint = endpoint + '/';
        res = AzureAuth.getDefaultScope(endpoint);
        assert.strictEqual(res, "https://localhost/com/.default");
    });
    test("getCredential happy path", async () => {
        let mockEvent = <vscode.Event<SignInStatus>>{};
        let successSession = <Utils.Succeeded<AzureAuthenticationSession>>{
            succeeded: true,
            result: {
                accessToken: "fakeToken"
            }
        };
        let azureSessionProvider: ReadyAzureSessionProvider = {
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
            getAuthSession: function (options?: GetAuthSessionOptions | undefined): Promise<Utils.Errorable<AzureAuthenticationSession>> {
                return Promise.resolve(successSession);
            },
            dispose: function (): void {
                throw new Error("Function not implemented.");
            }
        }
        const res = AzureAuth.getCredential(azureSessionProvider);
        const res1 = await res.getToken("test");
        assert.equal(res1?.expiresOnTimestamp, 0);
        assert.strictEqual(res1?.token, "fakeToken");
    });
    test("getCredential failed", async () => {
        let mockEvent = <vscode.Event<SignInStatus>>{};
        let failedSession = <Utils.Failed>{
            succeeded: false,
            error: "failed"
        };
        let azureSessionProvider: ReadyAzureSessionProvider = {
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
            getAuthSession: function (options?: GetAuthSessionOptions | undefined): Promise<Utils.Errorable<AzureAuthenticationSession>> {
                return Promise.resolve(failedSession);
            },
            dispose: function (): void {
                throw new Error("Function not implemented.");
            }
        }
        const res = AzureAuth.getCredential(azureSessionProvider);
        try {
            await res.getToken("test");
        } catch (err) {
            assert.strictEqual((err as Error).message, "No Microsoft authentication session found: failed")
        }
    })
})
