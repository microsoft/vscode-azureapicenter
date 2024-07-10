// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { RulesTreeItem } from "../../tree/rules/RulesTreeItem";

export async function enableRules(context: IActionContext, node: RulesTreeItem) {
    const a = node.apicenter;
    vscode.window.showInformationMessage(`Enable rules for ${a.name}`);
}
