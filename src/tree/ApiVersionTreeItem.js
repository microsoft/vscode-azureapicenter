"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersionTreeItem = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const treeUtils_1 = require("../utils/treeUtils");
const ApiVersionDefinitionsTreeItem_1 = require("./ApiVersionDefinitionsTreeItem");
class ApiVersionTreeItem extends vscode_azext_utils_1.AzExtParentTreeItem {
    constructor(parent, apiCenterName, apiCenterApiName, apiCenterApiVersion) {
        super(parent);
        this.contextValue = ApiVersionTreeItem.contextValue;
        this._apiCenterApiVersion = apiCenterApiVersion;
        this.apiVersionDefinitionsTreeItem = new ApiVersionDefinitionsTreeItem_1.ApiVersionDefinitionsTreeItem(this, apiCenterName, apiCenterApiName, apiCenterApiVersion);
    }
    get iconPath() {
        return treeUtils_1.treeUtils.getIconPath('version');
    }
    get id() {
        return this._apiCenterApiVersion.id;
    }
    get label() {
        return this._apiCenterApiVersion.name;
    }
    hasMoreChildrenImpl() {
        return this._nextLink !== undefined;
    }
    async loadMoreChildrenImpl(clearCache, context) {
        return [this.apiVersionDefinitionsTreeItem];
    }
}
exports.ApiVersionTreeItem = ApiVersionTreeItem;
ApiVersionTreeItem.contextValue = "azureApiCenterApiVersion";
//# sourceMappingURL=ApiVersionTreeItem.js.map