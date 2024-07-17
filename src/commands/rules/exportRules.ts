// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { RulesTreeItem } from "../../tree/rules/RulesTreeItem";
import { UiStrings } from "../../uiStrings";
import { hasFiles } from "../../utils/fsUtil";
const fs = require('fs').promises;
const path = require('path');


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

    await node.exportRulesToLocalFolder(rulesFolderPath);
    await node.refresh(context);

    vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.RulesExported, rulesFolderPath));
}


