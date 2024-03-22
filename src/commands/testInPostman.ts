// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/* eslint-disable @typescript-eslint/naming-convention */
import { IActionContext } from '@microsoft/vscode-azext-utils';
import { commands } from 'vscode';
import { ext } from '../extensionVariables';
import { ApiVersionDefinitionTreeItem } from '../tree/ApiVersionDefinitionTreeItem';
import { ensureExtension } from '../utils/ensureExtension';

const PostmanExtensionId = 'postman.postman-for-vscode';
const PostmanCommandId = 'postman-for-vscode.sidebar-panel.focus';

export async function testInPostman(context: IActionContext, node: ApiVersionDefinitionTreeItem) {
    ensureExtension(context, {
        extensionId: PostmanExtensionId,
        noExtensionErrorMessage: 'Cannot test API in Postman unless the Postman extension is installed.',
    });

    // don't wait
    void ext.openApiEditor.showEditor(node);
    await commands.executeCommand(PostmanCommandId);
}
