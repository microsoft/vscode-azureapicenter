// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { SpectralExtensionId } from '../../constants';
import { FunctionTreeItem } from '../../tree/rules/FunctionTreeItem';
import { RuleTreeItem } from '../../tree/rules/RuleTreeItem';
import { UiStrings } from '../../uiStrings';
import { ensureExtension } from '../../utils/ensureExtension';
import { setRulesetFile } from '../../utils/ruleUtils';

export async function openRule(context: IActionContext, node: RuleTreeItem | FunctionTreeItem) {
    const document = await vscode.workspace.openTextDocument(node.fullFilePath);
    await vscode.window.showTextDocument(document);

    ensureExtension(context, {
        extensionId: SpectralExtensionId,
        noExtensionErrorMessage: UiStrings.NoSpectralExtension,
    });

    setRulesetFile(node.ruleFullFilePath, false);
}
