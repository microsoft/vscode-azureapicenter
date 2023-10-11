import { SubscriptionTreeItemBase } from "@microsoft/vscode-azext-azureutils";
import { ApiCenterTreeItem } from "./ApiCenterTreeItem";
import { AzExtTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import { ResourceGraphService } from "../azure/ResourceGraph/ResourceGraphService";

export class SubscriptionTreeItem extends SubscriptionTreeItemBase {
    private _nextLink: string | undefined;

    public hasMoreChildrenImpl(): boolean {
        return this._nextLink !== undefined;
    }

    public async loadMoreChildrenImpl(): Promise<AzExtTreeItem[]> {
        const resourceGraphService = new ResourceGraphService(this.subscription)

        const apiCenters = await resourceGraphService.listApiCenters();

        return await this.createTreeItemsWithErrorHandling(
            apiCenters,
            'invalidApiCenter',
            async apic => new ApiCenterTreeItem(this, apic),
            apic => apic.name
        );
    }
}