// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { SubscriptionTreeItemBase } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ResourceGraphService } from "../azure/ResourceGraph/ResourceGraphService";
import { TelemetryClient } from "../common/telemetryClient";
import { TelemetryEvent } from "../common/telemetryEvent";
import { UiStrings } from "../uiStrings";
import { treeUtils } from "../utils/treeUtils";
import { ApiCenterTreeItem } from "./ApiCenterTreeItem";

export class SubscriptionTreeItem extends SubscriptionTreeItemBase {
    public readonly childTypeLabel: string = UiStrings.SubscriptionTreeItemChildTypeLabel;

    private _nextLink: string | undefined;

    constructor(parent: AzExtParentTreeItem, subscription: ISubscriptionContext) {
        super(parent, subscription);
        this.iconPath = treeUtils.getIconPath('azureSubscription');
    }

    public hasMoreChildrenImpl(): boolean {
        return this._nextLink !== undefined;
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
