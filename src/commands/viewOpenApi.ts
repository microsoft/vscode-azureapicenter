import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";

const lintRuleFile = "https://raw.githubusercontent.com/azure/azure-api-style-guide/main/spectral.yaml";

export async function viewOpenApi(actionContext: IActionContext, node?: ApiVersionDefinitionTreeItem) {
    if (!node) {
        node = await ext.treeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(ApiVersionDefinitionTreeItem.contextValue, actionContext);
    }

    // set spectral ruleset
    const spectralLinterConfig = vscode.workspace.getConfiguration("spectral");

    // a quick pick of where the user's ruleset file is located in the system
    spectralLinterConfig.update("rulesetFile", lintRuleFile, vscode.ConfigurationTarget.Global);

    // show API spec in read-only editor
    await ext.openApiEditor.showReadOnlyEditor(node);
}
