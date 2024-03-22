// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";

export async function selectForCompare(context: IActionContext, node?: ApiVersionDefinitionTreeItem) {
    ext.selectedApiVersionDefinitionTreeItem = node!;
    vscode.commands.executeCommand('setContext', 'azure-api-center.isSelectedForCompare', true);
}
