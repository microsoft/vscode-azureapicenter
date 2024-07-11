// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { RulesTreeItem } from "../../tree/rules/RulesTreeItem";
import { hasFiles } from "../../utils/fsUtil";
const fs = require('fs').promises;
const path = require('path');


export async function exportRules(context: IActionContext, node: RulesTreeItem) {
    const rulesFolderPath = node.getRulesFolderPath();

    if (await hasFiles(rulesFolderPath)) {
        const overwrite = await vscode.window.showWarningMessage(
            `The rules folder '${rulesFolderPath}' is not empty. Do you want to overwrite the existing files?`,
            { modal: true },
            'Yes',
            'No');
        if (overwrite !== 'Yes') {
            return;
        }
    }

    await node.exportRulesToLocalFolder(rulesFolderPath);
    await node.refresh(context);
}


