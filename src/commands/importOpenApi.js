"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importOpenApi = void 0;
const vscode_1 = require("vscode");
const fse = require("fs-extra");
const ApiCenterService_1 = require("../azure/ApiCenter/ApiCenterService");
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
async function importOpenApi(context, node, importUsingLink = false) {
    const apiCenterService = new ApiCenterService_1.ApiCenterService(node?.subscription, (0, vscode_azext_azureutils_1.getResourceGroupFromId)(node?.id), node?.apiCenterName);
    if (!importUsingLink) {
        const uris = await askDocument(context);
        const uri = uris[0];
        const fileContent = await fse.readFile(uri.fsPath);
        vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Uploading spec to API Center",
            cancellable: false
        }, 
        // tslint:disable-next-line:no-non-null-assertion
        async () => {
            const importPayload = {
                format: "inline",
                value: fileContent.toString(),
                specificationDetails: {
                    name: "openapi",
                    version: "0.0.1"
                }
            };
            return apiCenterService.importSpecification(node?.apiCenterApiName, node?.apiCenterApiVersionName, node?.apiCenterApiVersionDefinition.name, importPayload);
        }).then(async () => {
            // tslint:disable-next-line:no-non-null-assertion
            await node.refresh(context);
            vscode_1.window.showInformationMessage("Spec uploaded successfully.");
        });
    }
    else {
        const openApiLink = await askLink(context);
        vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Uploading spec to API Center",
            cancellable: false
        }, 
        // tslint:disable-next-line:no-non-null-assertion
        async () => {
            const importPayload = {
                format: "link",
                value: openApiLink,
                specificationDetails: {
                    name: "openapi",
                    version: "0.0.1"
                }
            };
            return apiCenterService.importSpecification(node?.apiCenterApiName, node?.apiCenterApiVersionName, node?.apiCenterApiVersionDefinition.name, importPayload);
        }).then(async () => {
            // tslint:disable-next-line:no-non-null-assertion
            await node.refresh(context);
            vscode_1.window.showInformationMessage("Spec uploaded successfully.");
        });
    }
}
exports.importOpenApi = importOpenApi;
async function askDocument(context) {
    const openDialogOptions = {
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Import",
        filters: {
            JSON: ["json"]
        }
    };
    return await context.ui.showOpenDialog(openDialogOptions);
}
async function askLink(context) {
    const promptStr = 'Specify a OpenAPI 2.0 or 3.0 link.';
    return (await context.ui.showInputBox({
        prompt: promptStr,
        placeHolder: 'https://',
        validateInput: async (value) => {
            value = value ? value.trim() : '';
            const regexp = /http(s?):\/\/[\d\w][\d\w]*(\.[\d\w][\d\w-]*)*(:\d+)?(\/[\d\w-\.\?,'/\\\+&amp;=:%\$#_]*)?/;
            const isUrlValid = regexp.test(value);
            if (!isUrlValid) {
                return "Provide a valid link. example - https://petstore.swagger.io/v2/swagger.json";
            }
            else {
                return undefined;
            }
        }
    })).trim();
}
//# sourceMappingURL=importOpenApi.js.map