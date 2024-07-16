// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import {
    authentication,
    AuthenticationGetSessionOptions,
    AuthenticationSession,
    Event,
    EventEmitter,
    ExtensionContext,
    Disposable as VsCodeDisposable
} from "vscode";
import { GeneralUtils } from "../../utils/generalUtils";
import { DataPlaneAccount } from "../ApiCenter/ApiCenterDataPlaneAPIs";
import { AzureAuthenticationSession, AzureDataSessionProvider, SignInStatus } from "./authTypes";
import { AzureAuth } from "./azureAuth";
enum AuthScenario {
    Initialization,
    SignIn,
    GetSession,
    SignedOut,
}

export function generateScopes(clientId: string, tenantId: string): string[] {
    return [
        `VSCODE_CLIENT_ID:${clientId}`, // Replace by your client id
        `VSCODE_TENANT:${tenantId}`, // Replace with the tenant ID or common if multi-tenant
        "offline_access", // Required for the refresh token.
        "https://azure-apicenter.net/user_impersonation"
    ]
}

export namespace AzureDataSessionProviderHelper {
    let sessionProvider: AzureDataSessionProvider;

    export function activateAzureSessionProvider(context: ExtensionContext) {
        sessionProvider = new AzureDataSessionProviderImpl();
        context.subscriptions.push(sessionProvider);
    }

    export function getSessionProvider(): AzureDataSessionProvider {
        return sessionProvider;
    }

    class AzureDataSessionProviderImpl extends VsCodeDisposable implements AzureDataSessionProvider {
        private handleSessionChanges: boolean = true;
        public signInStatusValue: SignInStatus = SignInStatus.Initializing;
        // private accountSet: Set<DataPlaneAccount> = new Set<DataPlaneAccount>();
        public readonly onSignInStatusChangeEmitter = new EventEmitter<SignInStatus>();
        constructor() {
            const disposable = authentication.onDidChangeSessions(async (e) => {
                // Ignore events for non-microsoft providers
                if (e.provider.id !== AzureAuth.getConfiguredAuthProviderId()) {
                    return;
                }

                // Ignore events that we triggered.
                if (!this.handleSessionChanges) {
                    return;
                }

                await this.updateSignInStatus([], AuthScenario.Initialization);
            });

            super(() => {
                this.onSignInStatusChangeEmitter.dispose();
                disposable.dispose();
            });
        }
        private async updateSignInStatus(_scopes: string[], authScenario: AuthScenario): Promise<void> {
            const orgTenantId = "organizations";
            const scopes = _scopes.length == 0 ? AzureAuth.getScopes(orgTenantId, {}) : _scopes;
            await this.getArmSession(orgTenantId, scopes, authScenario);
            this.onSignInStatusChangeEmitter.fire(this.signInStatusValue);
        }
        public get signInStatus(): SignInStatus {
            return this.signInStatusValue;
        }

        public async getAuthSession(scopes?: string[]): Promise<GeneralUtils.Errorable<AzureAuthenticationSession>> {
            return await this.getArmSession('microsoft', scopes!, AuthScenario.GetSession);
        }
        public async signIn(_scopes: string[]): Promise<void> {
            await this.updateSignInStatus(_scopes, AuthScenario.SignIn);
            this.onSignInStatusChangeEmitter.fire(this.signInStatusValue);
        }
        public get signInStatusChangeEvent(): Event<SignInStatus> {
            return this.onSignInStatusChangeEmitter.event;
        }

        public async signOutAll(dataPlaneAccounts: DataPlaneAccount[]): Promise<void> {
            for (let account of dataPlaneAccounts) {
                await this.getArmSession("microsoft", generateScopes(account.clientId, account.tenantId), AuthScenario.SignedOut);
            }
            this.onSignInStatusChangeEmitter.fire(this.signInStatusValue);
        }

        public async signOut(_scopes: string[]): Promise<void> {
            await this.getArmSession("microsoft", _scopes, AuthScenario.SignedOut);
            this.onSignInStatusChangeEmitter.fire(this.signInStatusValue);
        }

        private async getArmSession(
            tenantId: string,
            scopes: string[],
            authScenario: AuthScenario,
        ): Promise<GeneralUtils.Errorable<AzureAuthenticationSession>> {
            this.handleSessionChanges = false;
            try {
                let options: AuthenticationGetSessionOptions;
                let session: AuthenticationSession | undefined;
                switch (authScenario) {
                    case AuthScenario.Initialization:
                        options = { createIfNone: false, clearSessionPreference: true, silent: true };
                        session = await authentication.getSession('microsoft', scopes, options);
                        break;
                    case AuthScenario.SignIn:
                        options = { createIfNone: true, clearSessionPreference: true, silent: false };
                        session = await authentication.getSession('microsoft', scopes, options);
                        break;
                    case AuthScenario.GetSession:
                        // the 'createIfNone' option cannot be used with 'silent', but really we want both
                        // flags here (i.e. create a session silently, but do create one if it doesn't exist).
                        // To allow this, we first try to get a session silently.
                        session = await authentication.getSession('microsoft', scopes, { silent: true });
                        break;
                }
                if (!session) {
                    return { succeeded: false, error: "No Session Found" };
                }
                return { succeeded: true, result: Object.assign(session, { tenantId }) };
            } catch (e) {
                return { succeeded: false, error: GeneralUtils.getErrorMessage(e) };
            } finally {
                this.handleSessionChanges = true;
            }
        }
    }
}
