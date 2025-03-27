// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.


import { VSCodeAzureSubscriptionProvider } from '@microsoft/vscode-azext-azureauth';
import { getSelectedTenantAndSubscriptionIds } from '../../commands/accounts/selectSubscriptions';
import { ext } from '../../extensionVariables';

let vscodeAzureSubscriptionProvider: VSCodeAzureSubscriptionProvider | undefined;

export function createVSCodeAzureSubscriptionProviderFactory(): () => Promise<VSCodeAzureSubscriptionProvider> {
    return async (): Promise<VSCodeAzureSubscriptionProvider> => {
        vscodeAzureSubscriptionProvider ??= await createVSCodeAzureSubscriptionProvider();
        return vscodeAzureSubscriptionProvider;
    }
}

async function createVSCodeAzureSubscriptionProvider(): Promise<VSCodeAzureSubscriptionProvider> {
    // This will update the selected subscription IDs to ensure the filters are in the form of `${tenantId}/${subscriptionId}`
    await getSelectedTenantAndSubscriptionIds();

    return new VSCodeAzureSubscriptionProvider(ext.outputChannel);
}
