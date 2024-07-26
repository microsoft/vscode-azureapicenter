// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { FunctionTreeItem } from '../../tree/rules/FunctionTreeItem';
import { UiStrings } from '../../uiStrings';

export async function deleteCustomFunction(context: IActionContext, node: FunctionTreeItem) {
    const deleteCustomFunction = await vscode.window.showWarningMessage(
        vscode.l10n.t(UiStrings.DeleteCustomFunction, node.functionName),
        { modal: true },
        UiStrings.Yes,
        UiStrings.No);
    if (deleteCustomFunction !== UiStrings.Yes) {
        return;
    }

    await vscode.workspace.fs.delete(vscode.Uri.file(node.fullFilePath), { useTrash: true });

    await node.parent!.parent!.refresh(context);
}
