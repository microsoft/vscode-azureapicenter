// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import { ApisTreeItem } from "../tree/ApisTreeItem";

export async function cleanupSearchResult(context: IActionContext, node: ApisTreeItem) {
    await node.cleanUpSearch(context);
}
