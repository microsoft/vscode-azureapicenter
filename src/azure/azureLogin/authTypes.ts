// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AuthenticationSession, Event } from "vscode";
import { Utils } from "../../utils/utils";

export enum SignInStatus {
    Initializing = 'Initializing',
    SigningIn = 'SigningIn',
    SignedIn = 'SignedIn',
    SignedOut = 'SignedOut',
}

export enum SelectionType {
    Filtered,
    All,
    AllIfNoFilters,
}

export interface SubscriptionFilter {
    tenantId: string;
    subscriptionId: string;
}

export type TokenInfo = {
    token: string;
    expiry: Date;
};

export type AzureAuthenticationSession = AuthenticationSession & {
    tenantId: string;
};

export type Tenant = {
    name: string;
    id: string;
};

export type GetAuthSessionOptions = {
    applicationClientId?: string;
    scopes?: string[];
};

export type AzureSessionProvider = {
    signIn(): Promise<void>;
    signInStatus: SignInStatus;
    availableTenants: Tenant[];
    selectedTenant: Tenant | null;
    signInStatusChangeEvent: Event<SignInStatus>;
    getAuthSession(options?: GetAuthSessionOptions): Promise<Utils.Errorable<AzureAuthenticationSession>>;
    dispose(): void;
};

export type ReadyAzureSessionProvider = AzureSessionProvider & {
    signInStatus: SignInStatus.SignedIn;
    selectedTenant: Tenant;
};

export function isReady(provider: AzureSessionProvider): provider is ReadyAzureSessionProvider {
    return provider.signInStatus === SignInStatus.SignedIn && provider.selectedTenant !== null;
}
