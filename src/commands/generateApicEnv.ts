// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenterEnvironment } from "../azure/ApiCenter/contracts";
import { EnvironmentKind } from "../constants";
import { ext } from "../extensionVariables";
import { ApiCenterTreeItem } from "../tree/ApiCenterTreeItem";
import { EnvironmentsTreeItem } from "../tree/EnvironmentsTreeItem";
import { UiStrings } from "../uiStrings";
export async function generateApicEnv(context: IActionContext, node?: EnvironmentsTreeItem): Promise<void> {
    return new Promise(async (resolve, reject) => {
        if (!node) {
            const apiCenterNode = await ext.treeDataProvider.showTreeItemPicker<ApiCenterTreeItem>(ApiCenterTreeItem.contextValue, context);
            node = apiCenterNode.environmentsTreeItem;
        }

        if (!node) {
            return;
        }

        const apiEnvName = await vscode.window.showInputBox({
            title: UiStrings.ServiceName, prompt: UiStrings.InputValidEnvironemntName, ignoreFocusOut: true
        });

        if (!apiEnvName) {
            throw new UserCancelledError();
        }

        const envKind = await vscode.window.showQuickPick(Object.values(EnvironmentKind), { placeHolder: UiStrings.SelectEnvironmentKind });
        if (!envKind) {
            throw new UserCancelledError();
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: UiStrings.CreateingEnvironmentProgressTitle,
        }, async (progress, token) => {
            const resourceGroupName = getResourceGroupFromId(node!.apiCenter.id);
            const apiCenterService = new ApiCenterService(node!.parent?.subscription!, resourceGroupName, node!.apiCenter.name);
            const apicEnv = {
                name: apiEnvName,
                properties: {
                    kind: envKind,
                }
            }
            const result = await apiCenterService.createOrUpdateApiCenterEnvironment(apicEnv as ApiCenterEnvironment);
            node!.refresh(context);
        });
    });
}
