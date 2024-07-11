// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { RulesTreeItem } from "../../tree/rules/RulesTreeItem";

export async function deployRules(context: IActionContext, node: RulesTreeItem) {
    const a = node.apiCenter;
    vscode.window.showInformationMessage(`Deploy rules for ${a.name}`);
}
