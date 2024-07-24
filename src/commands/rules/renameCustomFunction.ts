// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from '@microsoft/vscode-azext-utils';
import * as path from 'path';
import * as vscode from 'vscode';
import { FunctionTreeItem } from '../../tree/rules/FunctionTreeItem';
import { UiStrings } from '../../uiStrings';

export async function renameCustomFunction(context: IActionContext, node: FunctionTreeItem) {
    const newCustomFunctionName = await vscode.window.showInputBox({ title: UiStrings.InputCustomFunctionName, ignoreFocusOut: true });
    if (!newCustomFunctionName) {
        return;
    }

    const sourcePathUri = vscode.Uri.file(node.fullFilePath);
    const targetPathUri = vscode.Uri.file(path.join(node.rulesFolderPath, node.functionsDir, `${newCustomFunctionName}.js`));

    await vscode.workspace.fs.rename(sourcePathUri, targetPathUri, { overwrite: false });

    await node.parent!.parent!.refresh(context);
}
