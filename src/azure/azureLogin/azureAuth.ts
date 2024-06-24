// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { TokenCredential } from "@azure/core-auth";
import { Environment } from "@azure/ms-rest-azure-env";
import * as vscode from "vscode";
import { Errorable, failed } from "../../utils/utils";
import { getConfiguredAzureEnv } from "./arm";
import { AzureSessionProvider, ReadyAzureSessionProvider, Tenant, isReady } from "./authTypes";
import { getSessionProvider } from "./azureSessionProvider";

export function getEnvironment(): Environment {
    return getConfiguredAzureEnv();
}

export function getCredential(sessionProvider: ReadyAzureSessionProvider): TokenCredential {
    return {
        getToken: async () => {
            const session = await sessionProvider.getAuthSession();
            if (failed(session)) {
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

export async function getReadySessionProvider(): Promise<Errorable<ReadyAzureSessionProvider>> {
    const sessionProvider = getSessionProvider();
    if (isReady(sessionProvider)) {
        return { succeeded: true, result: sessionProvider };
    }

    switch (sessionProvider.signInStatus) {
        case "Initializing":
        case "SigningIn":
            await waitForSignIn(sessionProvider);
            break;
        case "SignedOut":
            await sessionProvider.signIn();
            break;
        case "SignedIn":
            break;
    }

    // Get a session, which will prompt the user to select a tenant if necessary.
    const session = await sessionProvider.getAuthSession();
    if (failed(session)) {
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
                if (status === "SignedIn") {
                    listener?.dispose();
                    resolve(undefined);
                }
            });
        });
    });
}
