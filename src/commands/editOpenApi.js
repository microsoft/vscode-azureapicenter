"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showOpenApi = void 0;
const vscode_1 = require("vscode");
const extensionVariables_1 = require("../extensionVariables");
const ApiVersionDefinitionTreeItem_1 = require("../tree/ApiVersionDefinitionTreeItem");
async function showOpenApi(actionContext, node) {
    if (!node) {
        node = await extensionVariables_1.ext.treeDataProvider.showTreeItemPicker(ApiVersionDefinitionTreeItem_1.ApiVersionDefinitionTreeItem.contextValue, actionContext);
    }
    await extensionVariables_1.ext.openApiEditor.showEditor(node);
    vscode_1.commands.executeCommand('setContext', 'isEditorEnabled', true);
}
exports.showOpenApi = showOpenApi;
//# sourceMappingURL=editOpenApi.js.map