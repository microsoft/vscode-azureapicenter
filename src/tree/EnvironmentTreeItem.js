"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentTreeItem = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const treeUtils_1 = require("../utils/treeUtils");
class EnvironmentTreeItem extends vscode_azext_utils_1.AzExtTreeItem {
    constructor(parent, apiCenterEnv) {
        super(parent);
        this.contextValue = EnvironmentTreeItem.contextValue;
        this._apiCenterEnv = apiCenterEnv;
    }
    get iconPath() {
        return treeUtils_1.treeUtils.getIconPath('env');
    }
    get id() {
        return this._apiCenterEnv.id;
    }
    get label() {
        return this._apiCenterEnv.name;
    }
}
exports.EnvironmentTreeItem = EnvironmentTreeItem;
EnvironmentTreeItem.contextValue = "azureApiCenterEnvironment";
//# sourceMappingURL=EnvironmentTreeItem.js.map