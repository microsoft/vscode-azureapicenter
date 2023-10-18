/* eslint-disable @typescript-eslint/naming-convention */
import { IActionContext } from '@microsoft/vscode-azext-utils';
import { commands, extensions, l10n } from 'vscode';
import { ext } from '../extensionVariables';
import { ApiVersionDefinitionTreeItem } from '../tree/ApiVersionDefinitionTreeItem';

const PostmanExtensionId = 'postman.postman-for-vscode';
const PostmanCommandId = 'postman-for-vscode.sidebar-panel.focus';

export async function testInPostman(context: IActionContext, node: ApiVersionDefinitionTreeItem) {
    ensurePostmanExtension(context);

    await ext.openApiEditor.showEditor(node);
    await commands.executeCommand(PostmanCommandId);
}

function ensurePostmanExtension(context: IActionContext): void {
    const extension = extensions.getExtension(PostmanExtensionId);

    // if extension is not installed, install it
    if (!extension) {
        context.errorHandling.suppressReportIssue = true;
        context.errorHandling.buttons = [
            {
                title: l10n.t('Open Extension'),
                callback: async () => commands.executeCommand('extension.open', PostmanExtensionId),
            }
        ];
        throw new Error(l10n.t('Cannot test API in Postman unless the Postman extension is installed.'));
    }

    // TODO: should we check version? if so which one?
 }
