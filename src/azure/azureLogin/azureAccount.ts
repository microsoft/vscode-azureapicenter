// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { QuickPickItem, Uri, env, window } from "vscode";
import { UiStrings } from "../../uiStrings";
import { failed } from "../../utils/utils";
import { SignInStatus } from "./authTypes";
import { getReadySessionProvider, quickPickTenant } from "./azureAuth";
import { getSessionProvider } from "./azureSessionProvider";
import { SelectionType, SubscriptionFilter, getFilteredSubscriptions, getSubscriptions, setFilteredSubscriptions } from "./subscriptions";
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
        if (failed(sessionResult)) {
            window.showErrorMessage(sessionResult.error);
        }

        return;
    }

    const selectedTenant = await quickPickTenant(sessionProvider.availableTenants);
    if (!selectedTenant) {
        window.showInformationMessage(UiStrings.NoTenantSelected);
        return;
    }

    sessionProvider.selectedTenant = selectedTenant;
}

type SubscriptionQuickPickItem = QuickPickItem & { subscription: SubscriptionFilter };

export async function selectSubscriptions(): Promise<void> {
    const sessionProvider = await getReadySessionProvider();
    if (failed(sessionProvider)) {
        window.showErrorMessage(sessionProvider.error);
        return;
    }

    const allSubscriptions = await getSubscriptions(sessionProvider.result, SelectionType.All);
    if (failed(allSubscriptions)) {
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
    if (failed(session)) {
        window.showErrorMessage(session.error);
        return;
    }

    const filteredSubscriptions = await getFilteredSubscriptions();

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

    await setFilteredSubscriptions(newFilteredSubscriptions);
}
