// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { openInPortal as openInPortalInternal } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";

export default async function openInAzurePortal(_context: IActionContext, node?: AzExtParentTreeItem) {
    if (!node) {
        return;
    }
    await openInPortalInternal(node, node.fullId);
};

