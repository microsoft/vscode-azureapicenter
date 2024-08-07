// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as path from 'path';
import * as vscode from 'vscode';
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenterRulesetConfig, ApiCenterRulesetImport } from "../../azure/ApiCenter/contracts";
import { ext } from "../../extensionVariables";
import { RulesTreeItem } from "../../tree/rules/RulesTreeItem";
import { UiStrings } from "../../uiStrings";
import { zipFolderToBuffer } from "../../utils/zipUtils";

const apiCenterRulesetConfig: ApiCenterRulesetConfig = {
    properties: {
        analyzerVersion: "1.0.0",
        apiType: "rest",
        lifecycleStage: "testing",
    }
};

export async function enableRules(context: IActionContext, node: RulesTreeItem) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: UiStrings.EnableRules
    }, async (progress, token) => {
        const resourceGroupName = getResourceGroupFromId(node.apiCenter.id);
        const apiCenterService = new ApiCenterService(node.parent?.subscription!, resourceGroupName, node.apiCenter.name);

        const response = await apiCenterService.createOrUpdateApiCenterRulesetConfig(apiCenterRulesetConfig);

        if (response.status !== 200) {
            throw new Error(vscode.l10n.t(UiStrings.FailedToEnableRules, response.bodyAsText ? `Error: ${response.bodyAsText}` : `Status Code: ${response.status}`));
        }

        // Temporary workaround to deploy default rules after enabling rules
        // In future, default rules need to be generated in control plane
        const defaultRulesFolderPath = path.join(ext.context.extensionPath, 'templates', 'rules', 'default-ruleset');

        const content = (await zipFolderToBuffer(defaultRulesFolderPath)).toString('base64');

        const importPayload: ApiCenterRulesetImport = {
            value: content,
            format: "InlineZip",
        };
        const importRulesetResponse = await apiCenterService.importRuleset(importPayload);

        if (importRulesetResponse.isSuccessful) {
            vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.RulesEnabled, node.apiCenter.name));
            node.updateStatusToEnable();
            await node.refresh(context);
        } else {
            throw new Error(vscode.l10n.t(UiStrings.FailedToEnableRules, importRulesetResponse.message ? `Error: ${importRulesetResponse.message}` : ""));
        }
    });
}
