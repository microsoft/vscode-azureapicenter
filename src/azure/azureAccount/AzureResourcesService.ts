// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import type { GenericResource, ResourceGroup, ResourceManagementClient } from "@azure/arm-resources";
import { uiUtils } from "@microsoft/vscode-azext-azureutils";
import { createSubscriptionContext, IActionContext } from "@microsoft/vscode-azext-utils";
import { AzureSubscription } from "./azure";
import { createResourceClient } from "./azureClient";

export interface AzureResourcesService {
    listResources(context: IActionContext, subscription: AzureSubscription): Promise<GenericResource[]>;
    listResourceGroups(context: IActionContext, subscription: AzureSubscription): Promise<ResourceGroup[]>;
}

export const defaultAzureResourcesServiceFactory = (): AzureResourcesService => {
    async function createClient(context: IActionContext, subscription: AzureSubscription): Promise<ResourceManagementClient> {
        const subContext = createSubscriptionContext(subscription);
        return await createResourceClient([context, subContext]);
    }
    return {
        async listResources(context: IActionContext, subscription: AzureSubscription): Promise<GenericResource[]> {
            const client = await createClient(context, subscription);
            return uiUtils.listAllIterator(client.resources.list());
        },
        async listResourceGroups(context: IActionContext, subscription: AzureSubscription): Promise<ResourceGroup[]> {
            const client = await createClient(context, subscription);
            return uiUtils.listAllIterator(client.resourceGroups.list());
        },
    }
}

export type AzureResourcesServiceFactory = () => AzureResourcesService;
