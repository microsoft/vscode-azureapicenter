// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenterRulesetImport } from "../../azure/ApiCenter/contracts";
import { RulesTreeItem } from "../../tree/rules/RulesTreeItem";
import { UiStrings } from "../../uiStrings";
import { hasFiles } from "../../utils/fsUtil";
import { zipFolderToBuffer } from "../../utils/zipUtils";

export async function deployRules(context: IActionContext, node: RulesTreeItem) {
    const rulesFolderPath = node.getRulesFolderPath();

    if (!await hasFiles(rulesFolderPath)) {
        vscode.window.showWarningMessage(vscode.l10n.t(UiStrings.NoRulesFolder, rulesFolderPath));
        return;
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: UiStrings.DeployRules
    }, async (progress, token) => {
        const content = (await zipFolderToBuffer(rulesFolderPath)).toString('base64');

        const resourceGroupName = getResourceGroupFromId(node.apiCenter.id);
        const apiCenterService = new ApiCenterService(node.parent?.subscription!, resourceGroupName, node.apiCenter.name);

        const importPayload: ApiCenterRulesetImport = {
            value: content,
            format: "InlineZip",
        };
        const response = await apiCenterService.importRuleset(importPayload);

        if (response.isSuccessful) {
            vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.RulesDeployed, node.apiCenter.name));
        } else {
            throw new Error(vscode.l10n.t(UiStrings.FailedToDeployRules, response.message ? `Error: ${response.message}` : ""));
        }
    });
}
