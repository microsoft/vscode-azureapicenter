// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiSpecificationOptions } from "../constants";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { treeUtils } from "../utils/treeUtils";

export async function getApiSpecification(title: string, context: IActionContext): Promise<ApiVersionDefinitionTreeItem | vscode.Uri | undefined> {
    const apiSpecificationOption = await vscode.window.showQuickPick(Object.values(ApiSpecificationOptions), { title, ignoreFocusOut: true });
    if (!apiSpecificationOption) {
        return undefined;
    }

    switch (apiSpecificationOption) {
        case ApiSpecificationOptions.apiCenter:
            const node = await treeUtils.getDefinitionTreeNode(context);
            return node ? node : undefined;
        case ApiSpecificationOptions.localFile:
            const fileUri = await vscode.window.showOpenDialog();
            return fileUri?.[0];
        case ApiSpecificationOptions.activeEditor:
            return vscode.window.activeTextEditor?.document.uri;
    }
}
