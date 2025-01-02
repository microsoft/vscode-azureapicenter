// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { RulesTreeItem } from "../../tree/rules/RulesTreeItem";
import { UiStrings } from "../../uiStrings";
import { hasFiles } from "../../utils/fsUtil";

export async function exportRules(context: IActionContext, node: RulesTreeItem) {
    const rulesFolderPath = node.getRulesFolderPath();

    if (await hasFiles(rulesFolderPath)) {
        const overwrite = await vscode.window.showWarningMessage(
            vscode.l10n.t(UiStrings.RulesFolderNotEmpty, rulesFolderPath),
            { modal: true },
            UiStrings.Yes,
            UiStrings.No);
        if (overwrite !== UiStrings.Yes) {
            return;
        }
    }

    const base64ZipContent = await node.exportRuleset();
    if (!base64ZipContent) {
        throw new Error(UiStrings.NoRulesExported);
    }
    await node.unzipRulesetToLocalFolder(rulesFolderPath, base64ZipContent);
    await node.refresh(context);

    vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.RulesExported, rulesFolderPath));
}
