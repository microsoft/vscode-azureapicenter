/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import type { Environment } from '@azure/ms-rest-azure-env';
import * as vscode from 'vscode';

/**
 * Represents a means of obtaining authentication data for an Azure subscription.
 */
export interface AzureAuthentication {
    /**
     * Gets a VS Code authentication session for an Azure subscription.
     *
     * @param scopes - The scopes for which the authentication is needed.
     *
     * @returns A VS Code authentication session or undefined, if none could be obtained.
     */
    getSession(scopes?: string[]): vscode.ProviderResult<vscode.AuthenticationSession>;
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
}
