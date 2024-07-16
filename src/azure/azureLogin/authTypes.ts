// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AuthenticationSession, Event } from "vscode";
import { GeneralUtils } from "../../utils/generalUtils";
import { DataPlaneAccount } from "../ApiCenter/ApiCenterDataPlaneAPIs";

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
    getAuthSession(options?: GetAuthSessionOptions): Promise<GeneralUtils.Errorable<AzureAuthenticationSession>>;
    dispose(): void;
};

export type AzureDataSessionProvider = {
    signIn(_scopes: string[]): Promise<void>;
    signOut(_scopes: string[]): Promise<void>;
    signOutAll(_accounts: DataPlaneAccount[]): Promise<void>;
    signInStatus: SignInStatus;
    signInStatusChangeEvent: Event<SignInStatus>;
    getAuthSession(scopes?: string[]): Promise<GeneralUtils.Errorable<AzureAuthenticationSession>>;
    dispose(): void;
}

export type ReadyAzureSessionProvider = AzureSessionProvider & {
    signInStatus: SignInStatus.SignedIn;
    selectedTenant: Tenant;
};
