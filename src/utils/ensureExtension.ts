import { IActionContext } from "@microsoft/vscode-azext-utils";
import { commands, extensions, l10n } from "vscode";

export type EnsureExtensionOptions = {
    readonly extensionId: string;
    readonly noExtensionErrorMessage: string;
};

export function ensureExtension(context: IActionContext, options: EnsureExtensionOptions) {
    const extension = extensions.getExtension(options.extensionId);
    // if extension is not installed, install it
    if (!extension) {
        context.errorHandling.suppressReportIssue = true;
        context.errorHandling.buttons = [
            {
                title: l10n.t('Open Extension'),
                callback: async () => commands.executeCommand('extension.open', options.extensionId),
            }
        ];
        throw new Error(l10n.t(options.noExtensionErrorMessage));
    }

    // TODO: should we check for the version of the extension?
}
