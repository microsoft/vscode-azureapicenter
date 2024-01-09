"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportOpenApi = void 0;
const ApiCenterService_1 = require("../azure/ApiCenter/ApiCenterService");
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
async function exportOpenApi(context, node) {
    const apiCenterService = new ApiCenterService_1.ApiCenterService(node?.subscription, (0, vscode_azext_azureutils_1.getResourceGroupFromId)(node?.id), node?.apiCenterName);
    const exportedSpec = await apiCenterService.exportSpecification(node?.apiCenterApiName, node?.apiCenterApiVersionName, node?.apiCenterApiVersionDefinition.name);
}
exports.exportOpenApi = exportOpenApi;
//# sourceMappingURL=exportOpenApi.js.map