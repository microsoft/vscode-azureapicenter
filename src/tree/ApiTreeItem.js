"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTreeItem = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const treeUtils_1 = require("../utils/treeUtils");
const ApiDeploymentsTreeItem_1 = require("./ApiDeploymentsTreeItem");
const ApiVersionsTreeItem_1 = require("./ApiVersionsTreeItem");
class ApiTreeItem extends vscode_azext_utils_1.AzExtParentTreeItem {
    constructor(parent, apiCenterName, apiCenterApi) {
        super(parent);
        this.contextValue = ApiTreeItem.contextValue;
        this._apiCenterName = apiCenterName;
        this._apiCenterApi = apiCenterApi;
        this.apiVersionsTreeItem = new ApiVersionsTreeItem_1.ApiVersionsTreeItem(this, apiCenterName, apiCenterApi);
        this.apiDeploymentsTreeItem = new ApiDeploymentsTreeItem_1.ApiDeploymentsTreeItem(this, apiCenterName, apiCenterApi);
    }
    get iconPath() {
        return treeUtils_1.treeUtils.getIconPath('api');
    }
    get id() {
        return this._apiCenterApi.id;
    }
    get label() {
        return this._apiCenterApi.name;
    }
    hasMoreChildrenImpl() {
        return this._nextLink !== undefined;
    }
    async loadMoreChildrenImpl(clearCache, context) {
        return [this.apiVersionsTreeItem, this.apiDeploymentsTreeItem];
    }
}
exports.ApiTreeItem = ApiTreeItem;
ApiTreeItem.contextValue = "azureApiCenterApi";
//# sourceMappingURL=ApiTreeItem.js.map