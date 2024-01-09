"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionTreeItem = void 0;
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
const ResourceGraphService_1 = require("../azure/ResourceGraph/ResourceGraphService");
const telemetryClient_1 = require("../common/telemetryClient");
const telemetryEvent_1 = require("../common/telemetryEvent");
const treeUtils_1 = require("../utils/treeUtils");
const ApiCenterTreeItem_1 = require("./ApiCenterTreeItem");
class SubscriptionTreeItem extends vscode_azext_azureutils_1.SubscriptionTreeItemBase {
    constructor(parent, subscription) {
        super(parent, subscription);
        this.iconPath = treeUtils_1.treeUtils.getIconPath('azureSubscription');
    }
    hasMoreChildrenImpl() {
        return this._nextLink !== undefined;
    }
    async loadMoreChildrenImpl() {
        telemetryClient_1.TelemetryClient.sendEvent(telemetryEvent_1.TelemetryEvent.treeviewListApiCenters);
        const resourceGraphService = new ResourceGraphService_1.ResourceGraphService(this.subscription);
        const apiCenters = await resourceGraphService.listApiCenters();
        return await this.createTreeItemsWithErrorHandling(apiCenters, 'invalidApiCenter', async (apic) => new ApiCenterTreeItem_1.ApiCenterTreeItem(this, apic), apic => apic.name);
    }
}
exports.SubscriptionTreeItem = SubscriptionTreeItem;
//# sourceMappingURL=SubscriptionTreeItem.js.map