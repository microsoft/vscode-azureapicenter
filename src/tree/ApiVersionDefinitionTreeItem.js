"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersionDefinitionTreeItem = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const treeUtils_1 = require("../utils/treeUtils");
class ApiVersionDefinitionTreeItem extends vscode_azext_utils_1.AzExtTreeItem {
    constructor(parent, apiCenterName, apiCenterApiName, apiCenterApiVersionName, apiCenterApiVersionDefinition) {
        super(parent);
        this.apiCenterName = apiCenterName;
        this.apiCenterApiName = apiCenterApiName;
        this.apiCenterApiVersionName = apiCenterApiVersionName;
        this.apiCenterApiVersionDefinition = apiCenterApiVersionDefinition;
        this.contextValue = ApiVersionDefinitionTreeItem.contextValue;
        this.contextValue += "-" + apiCenterApiVersionDefinition.properties.specification.name;
    }
    get iconPath() {
        return treeUtils_1.treeUtils.getIconPath('definition');
    }
    get id() {
        return this.apiCenterApiVersionDefinition.id;
    }
    get label() {
        return this.apiCenterApiVersionDefinition.name;
    }
}
exports.ApiVersionDefinitionTreeItem = ApiVersionDefinitionTreeItem;
ApiVersionDefinitionTreeItem.contextValue = "azureApiCenterApiVersionDefinitionTreeItem";
//# sourceMappingURL=ApiVersionDefinitionTreeItem.js.map