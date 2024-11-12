// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { SpectralExtensionId } from '../../constants';
import { FunctionTreeItem } from '../../tree/rules/FunctionTreeItem';
import { RuleTreeItem } from '../../tree/rules/RuleTreeItem';
import { UiStrings } from '../../uiStrings';
import { EnsureExtension } from '../../utils/ensureExtension';
import { GeneralUtils } from '../../utils/generalUtils';
import { SetRulesetFile } from '../../utils/ruleUtils';

export async function openRule(context: IActionContext, node: RuleTreeItem | FunctionTreeItem) {
    const document = await vscode.workspace.openTextDocument(node.fullFilePath);
    await vscode.window.showTextDocument(document);

    EnsureExtension.ensureExtension(context, {
        extensionId: SpectralExtensionId,
        noExtensionErrorMessage: UiStrings.NoSpectralExtension,
    });

    SetRulesetFile.setRulesetFile(node.ruleFullFilePath, false);

    if (!vscode.workspace.workspaceFolders) {
        const openFolder = await vscode.window.showWarningMessage(
            UiStrings.OpenApiCenterFolder,
            { modal: true },
            UiStrings.Yes,
            UiStrings.No);
        if (openFolder === UiStrings.Yes) {
            await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(GeneralUtils.getApiCenterWorkspacePath()), false);
        }
    }
}
