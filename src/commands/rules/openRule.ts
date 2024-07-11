// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { FunctionTreeItem } from '../../tree/rules/FunctionTreeItem';
import { RuleTreeItem } from '../../tree/rules/RuleTreeItem';

export async function openRule(context: IActionContext, node: RuleTreeItem | FunctionTreeItem) {
    const document = await vscode.workspace.openTextDocument(node.fullFilePath);
    await vscode.window.showTextDocument(document);
}
