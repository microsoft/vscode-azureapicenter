// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import type { Environment } from '@azure/ms-rest-azure-env';
import * as vscode from 'vscode';
/**
 * Represents a means of obtaining authentication data for an Azure subscription.
 */
export interface AzureAuthentication {
    /**
     * Gets a VS Code authentication session for an Azure subscription.
     * Always uses the default scope, `https://management.azure.com/.default/` and respects `microsoft-sovereign-cloud.environment` setting.
     *
     * @returns A VS Code authentication session or undefined, if none could be obtained.
     */
    getSession(): vscode.ProviderResult<vscode.AuthenticationSession>;
    /**
     * Gets a VS Code authentication session for an Azure subscription.
     *
     * @param scopes - The scopes for which the authentication is needed.
     *
     * @returns A VS Code authentication session or undefined, if none could be obtained.
     */
    getSessionWithScopes(scopes: string[]): vscode.ProviderResult<vscode.AuthenticationSession>;
}

/**
 * Represents an Azure subscription.
 */
export interface AzureSubscription {
    /**
     * Access to the authentication session associated with this subscription.
     */
    readonly authentication: AzureAuthentication;

    /**
     * The Azure environment to which this subscription belongs.
     */
    readonly environment: Environment;

    /**
     * Whether this subscription belongs to a custom cloud.
     */
    readonly isCustomCloud: boolean;

    /**
     * The display name of this subscription.
     */
    readonly name: string;

    /**
     * The ID of this subscription.
     */
    readonly subscriptionId: string;

    /**
     * The tenant to which this subscription belongs or undefined, if not associated with a specific tenant.
     */
    readonly tenantId: string;

    /**
     * The account associated with this subscription. This is optional as we only need the account if there are duplicate subscriptions.
     */
    readonly account?: vscode.AuthenticationSessionAccountInformation;
}
