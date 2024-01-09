"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenApiEditor = void 0;
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
const vscode_1 = require("vscode");
const ApiCenterService_1 = require("../../../azure/ApiCenter/ApiCenterService");
const constants_1 = require("../../../constants");
const localize_1 = require("../../../localize");
const Editor_1 = require("../Editor");
class OpenApiEditor extends Editor_1.Editor {
    constructor() {
        super(constants_1.showSavePromptConfigKey);
    }
    async getData(treeItem) {
        const apiCenterService = new ApiCenterService_1.ApiCenterService(treeItem?.subscription, (0, vscode_azext_azureutils_1.getResourceGroupFromId)(treeItem?.id), treeItem?.apiCenterName);
        const exportedSpec = await apiCenterService.exportSpecification(treeItem?.apiCenterApiName, treeItem?.apiCenterApiVersionName, treeItem?.apiCenterApiVersionDefinition.name);
        return exportedSpec.value;
    }
    async updateData(treeItem, data) {
        const apiCenterService = new ApiCenterService_1.ApiCenterService(treeItem?.subscription, (0, vscode_azext_azureutils_1.getResourceGroupFromId)(treeItem?.id), treeItem?.apiCenterName);
        return vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Uploading spec to API Center",
            cancellable: false
        }, 
        // tslint:disable-next-line:no-non-null-assertion
        async () => {
            const importPayload = {
                format: "inline",
                value: data.toString(),
                specificationDetails: {
                    name: "openapi", // TODO: we need to change this right?
                    version: "0.0.1" // TODO: we need to change this right?
                }
            };
            await apiCenterService.importSpecification(treeItem?.apiCenterApiName, treeItem?.apiCenterApiVersionName, treeItem?.apiCenterApiVersionDefinition.name, importPayload);
        }).then(async () => {
            vscode_1.window.showInformationMessage("Spec uploaded successfully.");
            return this.getData(treeItem);
        });
    }
    async getFilename(treeItem, options) {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}-${treeItem.apiCenterApiVersionName}--${treeItem.apiCenterApiVersionDefinition.name}-openapi-tempFile${options.fileType}`;
    }
    async getDiffFilename(treeItem, options) {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}-${treeItem.apiCenterApiVersionName}--${treeItem.apiCenterApiVersionDefinition.name}-openapi.json${options.fileType}`;
    }
    async getSaveConfirmationText(treeItem) {
        return (0, localize_1.localize)("", `Saving will update the API spec '${treeItem.apiCenterApiVersionDefinition.name}'.`);
    }
    getSize(context) {
        throw new Error((0, localize_1.localize)("", "Method not implemented."));
    }
}
exports.OpenApiEditor = OpenApiEditor;
//# sourceMappingURL=OpenApiEditor.js.map