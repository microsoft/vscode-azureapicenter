import { IActionContext } from "@microsoft/vscode-azext-utils";
import { ext } from "../extensionVariables";
import { ApisTreeItem } from "../tree/ApisTreeItem";

export async function refreshTree(context: IActionContext, node: ApisTreeItem) {
    // we're assuming this is a manual refresh, so we should wait for the tree to be ready
    if (node) {
        await node.cleanUpSearch(context);
        return;
    }
    await ext.treeItem.refresh(context);
}
