// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../extensionVariables";

export async function refreshTree(context: IActionContext) {    
    // we're assuming this is a manual refresh, so we should wait for the tree to be ready
    await ext.treeItem.refresh(context);
}