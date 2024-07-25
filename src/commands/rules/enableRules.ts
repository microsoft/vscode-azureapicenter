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
    const resourceGroupName = getResourceGroupFromId(node.apiCenter.id);
    const apiCenterService = new ApiCenterService(node.parent?.subscription!, resourceGroupName, node.apiCenter.name);

    let response = await apiCenterService.createOrUpdateApiCenterRulesetConfig(apiCenterRulesetConfig);

    if (response.status === 200) {
        vscode.window.showInformationMessage((vscode.l10n.t(UiStrings.RulesEnabled, node.apiCenter.name)));
    } else {
        vscode.window.showErrorMessage(vscode.l10n.t(UiStrings.FailedToEnableRules, response.bodyAsText ?? `status code ${response.status}`));
        return;
    }

    // Temporary workaround to deploy default rules after enabling rules
    // In future, default rules need to be generated in control plane
    const defaultRulesFolderPath = path.join(ext.context.extensionPath, 'templates', 'rules', 'default-ruleset');

    const content = (await zipFolderToBuffer(defaultRulesFolderPath)).toString('base64');

    const importPayload: ApiCenterRulesetImport = {
        value: content,
        format: "InlineZip",
    };
    response = await apiCenterService.importRuleset(importPayload);

    if (response.status === 200) {
        vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.RulesDeployed, node.apiCenter.name));
        node.updateStatusToEnable();
        await node.refresh(context);
    } else {
        vscode.window.showErrorMessage(vscode.l10n.t(UiStrings.FailedToDeployRules, response.bodyAsText ?? `status code ${response.status}`));
    }
}
