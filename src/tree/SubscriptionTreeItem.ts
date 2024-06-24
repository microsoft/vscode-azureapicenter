// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ReadyAzureSessionProvider } from "../azure/azureLogin/authTypes";
import { ResourceGraphService } from "../azure/ResourceGraph/ResourceGraphService";
import { TelemetryClient } from "../common/telemetryClient";
import { TelemetryEvent } from "../common/telemetryEvent";
import { treeUtils } from "../utils/treeUtils";
import { ApiCenterTreeItem } from "./ApiCenterTreeItem";

export function createSubscriptionTreeItem(
    parent: AzExtParentTreeItem,
    sessionProvider: ReadyAzureSessionProvider,
    subscription: ISubscriptionContext,
): AzExtTreeItem {
    return new SubscriptionTreeItem(parent, sessionProvider, subscription);
}

class SubscriptionTreeItem extends AzExtParentTreeItem {
    private readonly sessionProvider: ReadyAzureSessionProvider;
    public readonly subscriptionContext: ISubscriptionContext;
    public readonly subscriptionId: string;
    public readonly contextValue = "azureapicenter.azureSubscription";
    public readonly label: string;

    public constructor(
        parent: AzExtParentTreeItem,
        sessionProvider: ReadyAzureSessionProvider,
        subscription: ISubscriptionContext,
    ) {
        super(parent);
        this.sessionProvider = sessionProvider;
        this.subscriptionContext = subscription;
        this.subscriptionId = subscription.subscriptionId;
        this.label = subscription.subscriptionDisplayName;
        this.id = subscription.subscriptionPath;
        this.iconPath = treeUtils.getIconPath('azureSubscription');
    }

    get treeItem(): AzExtTreeItem {
        return this;
    }

    /**
     * Needed by parent class.
     */
    get subscription(): ISubscriptionContext {
        return this.subscriptionContext;
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async loadMoreChildrenImpl(): Promise<AzExtTreeItem[]> {
        TelemetryClient.sendEvent(TelemetryEvent.treeviewListApiCenters);

        const resourceGraphService = new ResourceGraphService(this.subscription);

        const apiCenters = await resourceGraphService.listApiCenters();

        return await this.createTreeItemsWithErrorHandling(
            apiCenters,
            'invalidApiCenter',
            async apic => new ApiCenterTreeItem(this, apic),
            apic => apic.name
        );
    }
}
