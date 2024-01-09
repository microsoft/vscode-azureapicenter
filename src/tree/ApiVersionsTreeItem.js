"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersionsTreeItem = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
const ApiCenterService_1 = require("../azure/ApiCenter/ApiCenterService");
const treeUtils_1 = require("../utils/treeUtils");
const ApiVersionTreeItem_1 = require("./ApiVersionTreeItem");
class ApiVersionsTreeItem extends vscode_azext_utils_1.AzExtParentTreeItem {
    constructor(parent, apiCenterName, apiCenterApi) {
        super(parent);
        this.contextValue = ApiVersionsTreeItem.contextValue;
        this._apiCenterName = apiCenterName;
        this._apiCenterApi = apiCenterApi;
    }
    get iconPath() {
        return treeUtils_1.treeUtils.getIconPath('list');
    }
    get label() {
        return "Versions";
    }
    async loadMoreChildrenImpl(clearCache, context) {
        const resourceGroupName = (0, vscode_azext_azureutils_1.getResourceGroupFromId)(this._apiCenterApi.id);
        const apiCenterService = new ApiCenterService_1.ApiCenterService(this.parent?.subscription, resourceGroupName, this._apiCenterName);
        const apis = await apiCenterService.getApiCenterApiVersions(this._apiCenterApi.name);
        this._nextLink = apis.nextLink;
        return await this.createTreeItemsWithErrorHandling(apis.value, 'invalidResource', resource => new ApiVersionTreeItem_1.ApiVersionTreeItem(this, this._apiCenterName, this._apiCenterApi.name, resource), resource => resource.name);
    }
    hasMoreChildrenImpl() {
        return this._nextLink !== undefined;
    }
}
exports.ApiVersionsTreeItem = ApiVersionsTreeItem;
ApiVersionsTreeItem.contextValue = "azureApiCenterApiVersions";
//# sourceMappingURL=ApiVersionsTreeItem.js.map