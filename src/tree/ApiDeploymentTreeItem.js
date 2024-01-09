"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDeploymentTreeItem = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const treeUtils_1 = require("../utils/treeUtils");
class ApiDeploymentTreeItem extends vscode_azext_utils_1.AzExtTreeItem {
    constructor(parent, apiCenterApiDeployment) {
        super(parent);
        this.contextValue = ApiDeploymentTreeItem.contextValue;
        this._apiCenterApiDeployment = apiCenterApiDeployment;
    }
    get iconPath() {
        return treeUtils_1.treeUtils.getIconPath('deployment');
    }
    get id() {
        return this._apiCenterApiDeployment.id;
    }
    get label() {
        return this._apiCenterApiDeployment.name;
    }
}
exports.ApiDeploymentTreeItem = ApiDeploymentTreeItem;
ApiDeploymentTreeItem.contextValue = "azureApiCenterApiDeployment";
//# sourceMappingURL=ApiDeploymentTreeItem.js.map