"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureExtension = void 0;
const vscode_1 = require("vscode");
function ensureExtension(context, options) {
    const extension = vscode_1.extensions.getExtension(options.extensionId);
    // if extension is not installed, install it
    if (!extension) {
        context.errorHandling.suppressReportIssue = true;
        context.errorHandling.buttons = [
            {
                title: vscode_1.l10n.t('Open Extension'),
                callback: async () => vscode_1.commands.executeCommand('extension.open', options.extensionId),
            }
        ];
        throw new Error(vscode_1.l10n.t(options.noExtensionErrorMessage));
    }
    // TODO: should we check for the version of the extension?
}
exports.ensureExtension = ensureExtension;
//# sourceMappingURL=ensureExtension.js.map