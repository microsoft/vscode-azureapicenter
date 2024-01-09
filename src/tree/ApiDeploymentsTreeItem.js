"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDeploymentsTreeItem = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
const ApiCenterService_1 = require("../azure/ApiCenter/ApiCenterService");
const treeUtils_1 = require("../utils/treeUtils");
const ApiDeploymentTreeItem_1 = require("./ApiDeploymentTreeItem");
class ApiDeploymentsTreeItem extends vscode_azext_utils_1.AzExtParentTreeItem {
    constructor(parent, apiCenterName, apiCenterApi) {
        super(parent);
        this.contextValue = ApiDeploymentsTreeItem.contextValue;
        this._apiCenterName = apiCenterName;
        this._apiCenterApi = apiCenterApi;
    }
    get iconPath() {
        return treeUtils_1.treeUtils.getIconPath('list');
    }
    get label() {
        return "Deployments";
    }
    async loadMoreChildrenImpl(clearCache, context) {
        const resourceGroupName = (0, vscode_azext_azureutils_1.getResourceGroupFromId)(this._apiCenterApi.id);
        const apiCenterService = new ApiCenterService_1.ApiCenterService(this.parent?.subscription, resourceGroupName, this._apiCenterName);
        const apis = await apiCenterService.getApiCenterApiDeployments(this._apiCenterApi.name);
        this._nextLink = apis.nextLink;
        return await this.createTreeItemsWithErrorHandling(apis.value, 'invalidResource', resource => new ApiDeploymentTreeItem_1.ApiDeploymentTreeItem(this, resource), resource => resource.name);
    }
    hasMoreChildrenImpl() {
        return this._nextLink !== undefined;
    }
}
exports.ApiDeploymentsTreeItem = ApiDeploymentsTreeItem;
ApiDeploymentsTreeItem.contextValue = "azureApiCenterApiDeployments";
//# sourceMappingURL=ApiDeploymentsTreeItem.js.map