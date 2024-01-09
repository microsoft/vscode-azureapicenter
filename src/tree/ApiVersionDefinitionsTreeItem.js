"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiVersionDefinitionsTreeItem = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
const ApiCenterService_1 = require("../azure/ApiCenter/ApiCenterService");
const treeUtils_1 = require("../utils/treeUtils");
const ApiVersionDefinitionTreeItem_1 = require("./ApiVersionDefinitionTreeItem");
class ApiVersionDefinitionsTreeItem extends vscode_azext_utils_1.AzExtParentTreeItem {
    constructor(parent, apiCenterName, apiCenterApiName, apiCenterApiVersion) {
        super(parent);
        this.contextValue = ApiVersionDefinitionsTreeItem.contextValue;
        this._apiCenterApiVersion = apiCenterApiVersion;
        this._apiCenterName = apiCenterName;
        this._apiCenterApiName = apiCenterApiName;
    }
    get iconPath() {
        return treeUtils_1.treeUtils.getIconPath('list');
    }
    get label() {
        return "Definitions";
    }
    async loadMoreChildrenImpl(clearCache, context) {
        const resourceGroupName = (0, vscode_azext_azureutils_1.getResourceGroupFromId)(this._apiCenterApiVersion.id);
        const apiCenterService = new ApiCenterService_1.ApiCenterService(this.parent?.subscription, resourceGroupName, this._apiCenterName);
        const definitions = await apiCenterService.getApiCenterApiVersionDefinitions(this._apiCenterApiName, this._apiCenterApiVersion.name);
        this._nextLink = definitions.nextLink;
        return await this.createTreeItemsWithErrorHandling(definitions.value, 'invalidResource', resource => new ApiVersionDefinitionTreeItem_1.ApiVersionDefinitionTreeItem(this, this._apiCenterName, this._apiCenterApiName, this._apiCenterApiVersion.name, resource), resource => resource.name);
    }
    hasMoreChildrenImpl() {
        return this._nextLink !== undefined;
    }
}
exports.ApiVersionDefinitionsTreeItem = ApiVersionDefinitionsTreeItem;
ApiVersionDefinitionsTreeItem.contextValue = "azureApiCenterApiVersionDefinitions";
//# sourceMappingURL=ApiVersionDefinitionsTreeItem.js.map