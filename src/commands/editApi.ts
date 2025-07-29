// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import { commands } from "vscode";
import { ApiCenterVersionDefinitionManagement } from "../azure/ApiCenterDefines/ApiCenterDefinition";
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";

export async function editApi(actionContext: IActionContext, node?: ApiVersionDefinitionTreeItem) {
    if (!node) {
        node = await ext.treeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(new RegExp(`${ApiCenterVersionDefinitionManagement.contextValue}.*`), actionContext);
    }
    await ext.openApiEditor.showEditor(node);
    commands.executeCommand('setContext', 'isEditorEnabled', true);
}
