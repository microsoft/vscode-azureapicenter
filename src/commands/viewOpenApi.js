"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewOpenApi = void 0;
const vscode = require("vscode");
const extensionVariables_1 = require("../extensionVariables");
const ApiVersionDefinitionTreeItem_1 = require("../tree/ApiVersionDefinitionTreeItem");
const lintRuleFile = "https://raw.githubusercontent.com/azure/azure-api-style-guide/main/spectral.yaml";
async function viewOpenApi(actionContext, node) {
    if (!node) {
        node = await extensionVariables_1.ext.treeDataProvider.showTreeItemPicker(ApiVersionDefinitionTreeItem_1.ApiVersionDefinitionTreeItem.contextValue, actionContext);
    }
    // set spectral ruleset
    const spectralLinterConfig = vscode.workspace.getConfiguration("spectral");
    spectralLinterConfig.update("rulesetFile", lintRuleFile, vscode.ConfigurationTarget.Global);
    // show API spec in read-only editor
    await extensionVariables_1.ext.openApiEditor.showReadOnlyEditor(node);
}
exports.viewOpenApi = viewOpenApi;
//# sourceMappingURL=viewOpenApi.js.map