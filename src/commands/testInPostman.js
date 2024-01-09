"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testInPostman = void 0;
const vscode_1 = require("vscode");
const extensionVariables_1 = require("../extensionVariables");
const ensureExtension_1 = require("../utils/ensureExtension");
const PostmanExtensionId = 'postman.postman-for-vscode';
const PostmanCommandId = 'postman-for-vscode.sidebar-panel.focus';
async function testInPostman(context, node) {
    (0, ensureExtension_1.ensureExtension)(context, {
        extensionId: PostmanExtensionId,
        noExtensionErrorMessage: 'Cannot test API in Postman unless the Postman extension is installed.',
    });
    // don't wait
    void extensionVariables_1.ext.openApiEditor.showEditor(node);
    await vscode_1.commands.executeCommand(PostmanCommandId);
}
exports.testInPostman = testInPostman;
//# sourceMappingURL=testInPostman.js.map