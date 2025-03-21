// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { openInPortal } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";

export default async function openInAzurePortal(context: IActionContext, node?: AzExtParentTreeItem) {
    if (!node) {
        return;
    }
    await openInPortal(node, node.fullId);
};

