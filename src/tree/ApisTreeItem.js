"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApisTreeItem = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
const ApiCenterService_1 = require("../azure/ApiCenter/ApiCenterService");
const ApiTreeItem_1 = require("./ApiTreeItem");
const treeUtils_1 = require("../utils/treeUtils");
class ApisTreeItem extends vscode_azext_utils_1.AzExtParentTreeItem {
    constructor(parent, apiCenter) {
        super(parent);
        this.apiCenter = apiCenter;
        this.contextValue = ApisTreeItem.contextValue;
    }
    get iconPath() {
        return treeUtils_1.treeUtils.getIconPath('list');
    }
    get label() {
        return "Apis";
    }
    async loadMoreChildrenImpl(clearCache, context) {
        const resourceGroupName = (0, vscode_azext_azureutils_1.getResourceGroupFromId)(this.apiCenter.id);
        const apiCenterService = new ApiCenterService_1.ApiCenterService(this.parent?.subscription, resourceGroupName, this.apiCenter.name);
        const apis = await apiCenterService.getApiCenterApis();
        this._nextLink = apis.nextLink;
        return await this.createTreeItemsWithErrorHandling(apis.value, 'invalidResource', resource => new ApiTreeItem_1.ApiTreeItem(this, this.apiCenter.name, resource), resource => resource.name);
    }
    hasMoreChildrenImpl() {
        return this._nextLink !== undefined;
    }
}
exports.ApisTreeItem = ApisTreeItem;
ApisTreeItem.contextValue = "azureApiCenterApis";
//# sourceMappingURL=ApisTreeItem.js.map