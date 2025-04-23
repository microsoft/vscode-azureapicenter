// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { ext } from "../extensionVariables";
import { ApiCenterTreeItem } from "../tree/ApiCenterTreeItem";
import { ApisTreeItem } from "../tree/ApisTreeItem";
import { UiStrings } from "../uiStrings";

export async function registerMcp(context: IActionContext, node?: ApisTreeItem) {
    if (!node) {
        const apiCenterNode = await ext.treeDataProvider.showTreeItemPicker<ApiCenterTreeItem>(ApiCenterTreeItem.contextValue, context);
        node = apiCenterNode.apisTreeItem;
    }
    const deplymentName = await vscode.window.showInputBox({ title: UiStrings.ApiTitle, ignoreFocusOut: true, validateInput: validateInputForTitle });
    if (!deplymentName) {
        return;
    }
    const mcpName = await vscode.window.showInputBox({ title: UiStrings.ApiTitle, ignoreFocusOut: true, validateInput: validateInputForTitle });
    if (!mcpName) {
        return;
    }
}

function validateInputForTitle(value: string) {
    if (!value) {
        return UiStrings.ValueNotBeEmpty;
    }
    const name = getNameFromTitle(value);
    if (name.length < 2) {
        return UiStrings.ValueAtLeast2Char;
    }
    if (!/[a-zA-Z0-9]/.test(name)) {
        return UiStrings.ValueStartWithAlphanumeric;
    }
}

function getNameFromTitle(title: string) {
    return title.trim().toLocaleLowerCase().replace(/ /g, '-').replace(/[^A-Za-z0-9-]/g, '');
}
