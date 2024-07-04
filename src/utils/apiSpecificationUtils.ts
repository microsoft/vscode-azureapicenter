// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiSpecificationOptions, openapi } from "../constants";
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";

export async function getApiSpecification(title: string, context: IActionContext): Promise<ApiVersionDefinitionTreeItem | vscode.Uri | undefined> {
    const apiSpecificationOption = await vscode.window.showQuickPick(Object.values(ApiSpecificationOptions), { title, ignoreFocusOut: true });
    if (!apiSpecificationOption) {
        return undefined;
    }

    switch (apiSpecificationOption) {
        case ApiSpecificationOptions.apiCenter:
            const node = await ext.treeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(`${ApiVersionDefinitionTreeItem.contextValue}-${openapi}`, context);
            return node;
        case ApiSpecificationOptions.localFile:
            const fileUri = await vscode.window.showOpenDialog();
            return fileUri?.[0];
        case ApiSpecificationOptions.activeEditor:
            return vscode.window.activeTextEditor?.document.uri;
    }
}
