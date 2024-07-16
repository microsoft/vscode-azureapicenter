// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenterRulesetConfig } from "../../azure/ApiCenter/contracts";
import { RulesTreeItem } from "../../tree/rules/RulesTreeItem";

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
        vscode.window.showInformationMessage(`Rules enabled for '${node.apiCenter.name}'`);
        node.updateStatusToEnable();
        await node.refresh(context);
    } else {
        vscode.window.showErrorMessage(`Failed to enable rules with status code ${response.status}${response.bodyAsText ? ", error message: " + response.bodyAsText : ""}`);
    }
}
