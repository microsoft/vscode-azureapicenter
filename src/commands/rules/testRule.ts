// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { RuleTreeItem } from '../../tree/rules/RuleTreeItem';
import { setRulesetFile } from '../../utils/ruleUtils';

export async function testRule(context: IActionContext, node: RuleTreeItem) {
    const document = await vscode.workspace.openTextDocument(node.fullFilePath);
    await vscode.window.showTextDocument(document);

    const folderUri = vscode.Uri.file(node.rulesFolderPath);

    // Add the folder to the workspace
    const wasAdded = vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0, null, { uri: folderUri });

    if (wasAdded) {
        vscode.window.showInformationMessage('Folder added to workspace.');
    } else {
        vscode.window.showInformationMessage('Failed to add folder to workspace.');
    }

    // ensureExtension(context, {
    //     extensionId: 'stoplight.spectral',
    //     noExtensionErrorMessage: UiStrings.NoSpectralExtension,
    // });

    setRulesetFile(node.fullFilePath);
}
