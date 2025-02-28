// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ResourceGraphService } from "../azure/ResourceGraph/ResourceGraphService";
import { TelemetryClient } from "../common/telemetryClient";
import { TelemetryEvent } from "../common/telemetryEvent";
import { UiStrings } from "../uiStrings";
import { TelemetryUtils } from "../utils/telemetryUtils";
import { treeUtils } from "../utils/treeUtils";
import { ApiCenterTreeItem } from "./ApiCenterTreeItem";

export function createSubscriptionTreeItem(
    parent: AzExtParentTreeItem,
    subscription: ISubscriptionContext,
): AzExtTreeItem {
    return new SubscriptionTreeItem(parent, subscription);
}

export class SubscriptionTreeItem extends AzExtParentTreeItem {
    public readonly subscriptionContext: ISubscriptionContext;
    public readonly subscriptionId: string;
    public static contextValue: string = "azureApiCenterAzureSubscription";
    public readonly contextValue: string = SubscriptionTreeItem.contextValue;
    public readonly label: string;
    public readonly childTypeLabel: string = UiStrings.SubscriptionTreeItemChildTypeLabel;

    public constructor(
        parent: AzExtParentTreeItem,
        subscription: ISubscriptionContext,
    ) {
        super(parent);
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
        const properties: { [key: string]: string; } = {};
        TelemetryUtils.setAzureResourcesInfo(properties, this);
        TelemetryClient.sendEvent(TelemetryEvent.treeviewListApiCenters, properties);

        const resourceGraphService = new ResourceGraphService(this.subscription);

        const apiCenters = await resourceGraphService.listApiCenters();
        console.dir(apiCenters, { depth: 5 });
        return await this.createTreeItemsWithErrorHandling(
            apiCenters,
            'invalidApiCenter',
            async apic => new ApiCenterTreeItem(this, apic),
            apic => apic.name
        );
    }
}
