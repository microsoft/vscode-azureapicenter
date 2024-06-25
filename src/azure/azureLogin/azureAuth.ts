// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { TokenCredential } from "@azure/core-auth";
import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { Environment, EnvironmentParameters } from "@azure/ms-rest-azure-env";
import * as vscode from "vscode";
import { Utils } from "../../utils/utils";
import { AzureSessionProvider, GetAuthSessionOptions, ReadyAzureSessionProvider, SignInStatus, Tenant, isReady } from "./authTypes";
import { getSessionProvider } from "./azureSessionProvider";
export namespace AzureAuth {
    export function getEnvironment(): Environment {
        return getConfiguredAzureEnv();
    }

    export function getCredential(sessionProvider: ReadyAzureSessionProvider): TokenCredential {
        return {
            getToken: async () => {
                const session = await sessionProvider.getAuthSession();
                if (Utils.failed(session)) {
                    throw new Error(`No Microsoft authentication session found: ${session.error}`);
                }

                return { token: session.result.accessToken, expiresOnTimestamp: 0 };
            },
        };
    }

    export function getDefaultScope(endpointUrl: string): string {
        // Endpoint URL is that of the audience, e.g. for ARM in the public cloud
        // it would be "https://management.azure.com".
        return endpointUrl.endsWith("/") ? `${endpointUrl}.default` : `${endpointUrl}/.default`;
    }

    export async function quickPickTenant(tenants: Tenant[]): Promise<Tenant | undefined> {
        const items: (vscode.QuickPickItem & { tenant: Tenant })[] = tenants.map((t) => ({
            label: `${t.name} (${t.id})`,
            tenant: t,
        }));
        const result = await vscode.window.showQuickPick(items, {
            placeHolder: "Select a tenant",
        });
        return result ? result.tenant : undefined;
    }

    export async function getReadySessionProvider(): Promise<Utils.Errorable<ReadyAzureSessionProvider>> {
        const sessionProvider = getSessionProvider();
        if (isReady(sessionProvider)) {
            return { succeeded: true, result: sessionProvider };
        }

        switch (sessionProvider.signInStatus) {
            case SignInStatus.Initializing:
            case SignInStatus.SigningIn:
                await waitForSignIn(sessionProvider);
                break;
            case SignInStatus.SignedOut:
                await sessionProvider.signIn();
                break;
            case SignInStatus.SignedIn:
                break;
        }

        // Get a session, which will prompt the user to select a tenant if necessary.
        const session = await sessionProvider.getAuthSession();
        if (Utils.failed(session)) {
            return { succeeded: false, error: `Failed to get authentication session: ${session.error}` };
        }

        if (!isReady(sessionProvider)) {
            return { succeeded: false, error: "Not signed in." };
        }

        return { succeeded: true, result: sessionProvider };
    }

    async function waitForSignIn(sessionProvider: AzureSessionProvider): Promise<void> {
        const options: vscode.ProgressOptions = {
            location: vscode.ProgressLocation.Notification,
            title: "Waiting for sign-in",
            cancellable: true,
        };

        await vscode.window.withProgress(options, (_, token) => {
            let listener: vscode.Disposable | undefined;
            token.onCancellationRequested(listener?.dispose());
            return new Promise((resolve) => {
                listener = sessionProvider.signInStatusChangeEvent((status) => {
                    if (status === SignInStatus.SignedIn) {
                        listener?.dispose();
                        resolve(undefined);
                    }
                });
            });
        });
    }

    export function getConfiguredAzureEnv(): Environment {
        // See:
        // https://github.com/microsoft/vscode/blob/eac16e9b63a11885b538db3e0b533a02a2fb8143/extensions/microsoft-authentication/package.json#L40-L99
        const section = "microsoft-sovereign-cloud";
        const settingName = "environment";
        const authProviderConfig = vscode.workspace.getConfiguration(section);
        const environmentSettingValue = authProviderConfig.get<string | undefined>(settingName);

        if (environmentSettingValue === "ChinaCloud") {
            return Environment.ChinaCloud;
        } else if (environmentSettingValue === "USGovernment") {
            return Environment.USGovernment;
        } else if (environmentSettingValue === "custom") {
            const customCloud = authProviderConfig.get<EnvironmentParameters | undefined>("customEnvironment");
            if (customCloud) {
                return new Environment(customCloud);
            }

            throw new Error(
                `The custom cloud choice is not configured. Please configure the setting ${section}.${settingName}.`,
            );
        }

        return Environment.get(Environment.AzureCloud.name);
    }

    export async function listAll<T>(iterator: PagedAsyncIterableIterator<T>): Promise<Utils.Errorable<T[]>> {
        const result: T[] = [];
        try {
            for await (const page of iterator.byPage()) {
                result.push(...page);
            }
            return { succeeded: true, result };
        } catch (e) {
            return { succeeded: false, error: `Failed to list resources: ${Utils.getErrorMessage(e)}` };
        }
    }

    export function getScopes(tenantId: string | null, options: GetAuthSessionOptions): string[] {
        const defaultScopes = options.scopes || [AzureAuth.getDefaultScope(AzureAuth.getConfiguredAzureEnv().resourceManagerEndpointUrl)];
        const tenantScopes = tenantId ? [`VSCODE_TENANT:${tenantId}`] : [];
        const clientIdScopes = options.applicationClientId ? [`VSCODE_CLIENT_ID:${options.applicationClientId}`] : [];
        return [...defaultScopes, ...tenantScopes, ...clientIdScopes];
    }

    type AuthProviderId = "microsoft" | "microsoft-sovereign-cloud";

    export function getConfiguredAuthProviderId(): AuthProviderId {
        return AzureAuth.getConfiguredAzureEnv().name === Environment.AzureCloud.name ? "microsoft" : "microsoft-sovereign-cloud";
    }
}
