"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApiLibrary = void 0;
const vscode = require("vscode");
const extensionVariables_1 = require("../extensionVariables");
const ensureExtension_1 = require("../utils/ensureExtension");
const KiotaExtensionId = 'ms-graph.kiota';
async function generateApiLibrary(context, node) {
    (0, ensureExtension_1.ensureExtension)(context, {
        extensionId: KiotaExtensionId,
        noExtensionErrorMessage: 'Please install the Kiota extension to generate the API library.',
    });
    const path = await extensionVariables_1.ext.openApiEditor.createTempFileFromTree(node);
    const descriptionUrl = encodeURIComponent(path);
    const uriScheme = vscode.env.uriScheme;
    const deepLink = `${uriScheme}://${KiotaExtensionId}/OpenDescription?descriptionUrl=${descriptionUrl}`;
    const uri = vscode.Uri.parse(deepLink);
    // don't wait
    void vscode.env.openExternal(uri);
}
exports.generateApiLibrary = generateApiLibrary;
//# sourceMappingURL=generateApiLibrary.js.map