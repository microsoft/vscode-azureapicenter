"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCenterTreeItem = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const ApisTreeItem_1 = require("./ApisTreeItem");
const EnvironmentsTreeItem_1 = require("./EnvironmentsTreeItem");
const treeUtils_1 = require("../utils/treeUtils");
class ApiCenterTreeItem extends vscode_azext_utils_1.AzExtParentTreeItem {
    constructor(parent, apicenter) {
        super(parent);
        this.contextValue = ApiCenterTreeItem.contextValue;
        this._apicenter = apicenter;
        this.apisTreeItem = new ApisTreeItem_1.ApisTreeItem(this, apicenter);
        this.environmentsTreeItem = new EnvironmentsTreeItem_1.EnvironmentsTreeItem(this, apicenter);
    }
    get iconPath() {
        return treeUtils_1.treeUtils.getIconPath('apiCenter');
    }
    get id() {
        return this._apicenter.id;
    }
    get label() {
        return this._apicenter.name;
    }
    hasMoreChildrenImpl() {
        return this._nextLink !== undefined;
    }
    async loadMoreChildrenImpl(clearCache, context) {
        return [this.apisTreeItem, this.environmentsTreeItem];
    }
}
exports.ApiCenterTreeItem = ApiCenterTreeItem;
ApiCenterTreeItem.contextValue = "azureApiCenter";
//# sourceMappingURL=ApiCenterTreeItem.js.map