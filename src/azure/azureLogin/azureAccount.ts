// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { SubscriptionClient, TenantIdDescription } from "@azure/arm-resources-subscriptions";
import { TokenCredential } from "@azure/core-auth";
import { AuthenticationSession, QuickPickItem, Uri, env, window } from "vscode";
import { UiStrings } from "../../uiStrings";
import { Utils } from "../../utils/utils";
import { SelectionType, SignInStatus, SubscriptionFilter, Tenant } from "./authTypes";
import { AzureAuth } from "./azureAuth";
import { getSessionProvider } from "./azureSessionProvider";
import { AzureSubscriptionHelper } from "./subscriptions";
export namespace AzureAccount {
    export async function signInToAzure(): Promise<void> {
        await getSessionProvider().signIn();
    }

    export async function selectTenant(): Promise<void> {
        const sessionProvider = getSessionProvider();
        if (sessionProvider.signInStatus !== SignInStatus.SignedIn) {
            window.showInformationMessage(UiStrings.SelectTenantBeforeSignIn);
            return;
        }

        if (sessionProvider.availableTenants.length === 1) {
            sessionProvider.selectedTenant = sessionProvider.availableTenants[0];

            // If this tenant wasn't previously selected, it was probably because it wasn't immediately
            // accessible (the user's current token didn't have access to it). Calling getAuthSession
            // will prompt the user to re-authenticate if necessary.
            const sessionResult = await sessionProvider.getAuthSession();
            if (Utils.failed(sessionResult)) {
                window.showErrorMessage(sessionResult.error);
            }

            return;
        }

        const selectedTenant = await AzureAuth.quickPickTenant(sessionProvider.availableTenants);
        if (!selectedTenant) {
            window.showInformationMessage(UiStrings.NoTenantSelected);
            return;
        }

        sessionProvider.selectedTenant = selectedTenant;
    }

    type SubscriptionQuickPickItem = QuickPickItem & { subscription: SubscriptionFilter };

    export async function selectSubscriptions(): Promise<void> {
        const sessionProvider = await AzureAuth.getReadySessionProvider();
        if (Utils.failed(sessionProvider)) {
            window.showErrorMessage(sessionProvider.error);
            return;
        }

        const allSubscriptions = await AzureSubscriptionHelper.getSubscriptions(sessionProvider.result, SelectionType.All);
        if (Utils.failed(allSubscriptions)) {
            window.showErrorMessage(allSubscriptions.error);
            return;
        }

        if (allSubscriptions.result.length === 0) {
            const noSubscriptionsFound = UiStrings.NoSubscriptionsFoundAndSetup;
            const setupAccount = UiStrings.SetUpAzureAccount;
            const response = await window.showInformationMessage(noSubscriptionsFound, setupAccount);
            if (response === setupAccount) {
                env.openExternal(Uri.parse("https://azure.microsoft.com/"));
            }

            return;
        }

        const session = await sessionProvider.result.getAuthSession();
        if (Utils.failed(session)) {
            window.showErrorMessage(session.error);
            return;
        }

        const filteredSubscriptions = await AzureSubscriptionHelper.getFilteredSubscriptions();

        const subscriptionsInCurrentTenant = filteredSubscriptions.filter(
            (sub) => sub.tenantId === session.result.tenantId,
        );
        const subscriptionsInOtherTenants = filteredSubscriptions.filter((sub) => sub.tenantId !== session.result.tenantId);

        const quickPickItems: SubscriptionQuickPickItem[] = allSubscriptions.result.map((sub) => {
            return {
                label: sub.displayName || "",
                description: sub.subscriptionId,
                picked: subscriptionsInCurrentTenant.some((filtered) => filtered.subscriptionId === sub.subscriptionId),
                subscription: {
                    subscriptionId: sub.subscriptionId || "",
                    tenantId: sub.tenantId || "",
                },
            };
        });

        const selectedItems = await window.showQuickPick(quickPickItems, {
            canPickMany: true,
            placeHolder: UiStrings.SelectSubscription,
        });

        if (!selectedItems) {
            return;
        }

        const newFilteredSubscriptions = [
            ...selectedItems.map((item) => item.subscription),
            ...subscriptionsInOtherTenants, // Retain filters in any other tenants.
        ];

        await AzureSubscriptionHelper.setFilteredSubscriptions(newFilteredSubscriptions);
    }

    export async function getTenants(session: AuthenticationSession): Promise<Utils.Errorable<Tenant[]>> {
        const armEndpoint = AzureAuth.getConfiguredAzureEnv().resourceManagerEndpointUrl;
        const credential: TokenCredential = {
            getToken: async () => {
                return { token: session.accessToken, expiresOnTimestamp: 0 };
            },
        };
        const subscriptionClient = new SubscriptionClient(credential, { endpoint: armEndpoint });

        const tenantsResult = await AzureAuth.listAll(subscriptionClient.tenants.list());
        return Utils.errMap(tenantsResult, (t) => t.filter(isTenant).map((t) => ({ name: t.displayName, id: t.tenantId })));
    }

    export function findTenant(tenants: Tenant[], tenantId: string): Tenant | null {
        return tenants.find((t) => t.id === tenantId) || null;
    }

    export function isTenant(tenant: TenantIdDescription): tenant is { tenantId: string; displayName: string } {
        return tenant.tenantId !== undefined && tenant.displayName !== undefined;
    }

    export function getIdString(tenants: Tenant[]): string {
        return tenants
            .map((t) => t.id)
            .sort()
            .join(",");
    }
}
