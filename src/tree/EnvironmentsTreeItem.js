"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentsTreeItem = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
const ApiCenterService_1 = require("../azure/ApiCenter/ApiCenterService");
const EnvironmentTreeItem_1 = require("./EnvironmentTreeItem");
const treeUtils_1 = require("../utils/treeUtils");
class EnvironmentsTreeItem extends vscode_azext_utils_1.AzExtParentTreeItem {
    constructor(parent, apicenter) {
        super(parent);
        this.contextValue = EnvironmentsTreeItem.contextValue;
        this._apiCenter = apicenter;
    }
    get label() {
        return "Environments";
    }
    get iconPath() {
        return treeUtils_1.treeUtils.getIconPath('list');
    }
    async loadMoreChildrenImpl(clearCache, context) {
        const resourceGroupName = (0, vscode_azext_azureutils_1.getResourceGroupFromId)(this._apiCenter.id);
        const apiCenterService = new ApiCenterService_1.ApiCenterService(this.parent?.subscription, resourceGroupName, this._apiCenter.name);
        const apis = await apiCenterService.getApiCenterEnvironments();
        this._nextLink = apis.nextLink;
        return await this.createTreeItemsWithErrorHandling(apis.value, 'invalidResource', resource => new EnvironmentTreeItem_1.EnvironmentTreeItem(this, resource), resource => resource.name);
    }
    hasMoreChildrenImpl() {
        return this._nextLink !== undefined;
    }
}
exports.EnvironmentsTreeItem = EnvironmentsTreeItem;
EnvironmentsTreeItem.contextValue = "azureApiCenterEnvironments";
//# sourceMappingURL=EnvironmentsTreeItem.js.map