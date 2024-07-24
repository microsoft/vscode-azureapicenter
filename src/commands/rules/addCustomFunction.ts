// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from '@microsoft/vscode-azext-utils';
import * as path from 'path';
import * as vscode from 'vscode';
import { ext } from '../../extensionVariables';
import { FunctionsTreeItem } from '../../tree/rules/FunctionsTreeItem';
import { UiStrings } from '../../uiStrings';

export async function addCustomFunction(context: IActionContext, node: FunctionsTreeItem) {
    const customFunctionName = await vscode.window.showInputBox({ title: UiStrings.InputCustomFunctionName, ignoreFocusOut: true });
    if (!customFunctionName) {
        return;
    }

    const sourcePathUri = vscode.Uri.file(path.join(ext.context.extensionPath, 'templates', 'rules', 'functions', 'function.js'));
    const targetPathUri = vscode.Uri.file(path.join(node.rulesFolderPath, node.functionsDir, `${customFunctionName}.js`));

    try {
        await vscode.workspace.fs.stat(targetPathUri);
        vscode.window.showWarningMessage(vscode.l10n.t(UiStrings.FileAlreadyExists, targetPathUri.fsPath));
        return;
    } catch (error) {
        // If the file does not exist, the error is caught here, and the function continues
    }

    await vscode.workspace.fs.copy(sourcePathUri, targetPathUri, { overwrite: false });

    await Promise.all([
        vscode.window.showTextDocument(targetPathUri),
        node.parent!.refresh(context)
    ]);
}
