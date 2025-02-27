// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as semver from 'semver';
import { commands, extensions, l10n } from "vscode";

export namespace EnsureExtension {
    export type EnsureExtensionOptions = {
        readonly extensionId: string;
        readonly noExtensionErrorMessage: string;
        readonly minimumVersion?: string;
    };

    export function ensureExtension(context: IActionContext, options: EnsureExtensionOptions) {
        const extension = extensions.getExtension(options.extensionId);
        // if extension is not installed or the version is less than the minimum required version, throw an error
        if (!extension || (options.minimumVersion && semver.lt(extension.packageJSON.version, options.minimumVersion))) {
            context.errorHandling.suppressReportIssue = true;
            context.errorHandling.buttons = [
                {
                    title: l10n.t('Open Extension'),
                    callback: async () => commands.executeCommand('extension.open', options.extensionId),
                }
            ];
            throw new Error(options.noExtensionErrorMessage);
        }
    }
}
