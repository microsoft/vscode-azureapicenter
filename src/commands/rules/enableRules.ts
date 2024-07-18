// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenterRulesetConfig } from "../../azure/ApiCenter/contracts";
import { RulesTreeItem } from "../../tree/rules/RulesTreeItem";
import { UiStrings } from "../../uiStrings";


export async function enableRules(context: IActionContext, node: RulesTreeItem) {
    const resourceGroupName = getResourceGroupFromId(node.apiCenter.id);
    const apiCenterService = new ApiCenterService(node.parent?.subscription!, resourceGroupName, node.apiCenter.name);

    const apiCenterRulesetConfig: ApiCenterRulesetConfig = {
        properties: {
            analyzerVersion: "1.0.0",
            apiType: "rest",
            lifecycleStage: "testing",
        }
    };
    const response = await apiCenterService.createOrUpdateApiCenterRulesetConfig(apiCenterRulesetConfig);

    if (response.status === 200) {
        vscode.window.showInformationMessage((vscode.l10n.t(UiStrings.RulesEnabled, node.apiCenter.name)));
        node.updateStatusToEnable();
        await node.refresh(context);
    } else {
        vscode.window.showErrorMessage(vscode.l10n.t(UiStrings.FailedToEnableRules, response.bodyAsText ?? `status code ${response.status}`));
    }
}
