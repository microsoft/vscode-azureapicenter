// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenterEnvironment } from "../azure/ApiCenter/contracts";
import { ApiCenterEnvironmentServerType, ContinueToSkip, EnvironmentKind } from "../constants";
import { ext } from "../extensionVariables";
import { ApiCenterTreeItem } from "../tree/ApiCenterTreeItem";
import { EnvironmentsTreeItem } from "../tree/EnvironmentsTreeItem";
import { UiStrings } from "../uiStrings";
import { GeneralUtils } from "../utils/generalUtils";
export async function generateApicEnv(context: IActionContext, node?: EnvironmentsTreeItem): Promise<void> {
    if (!node) {
        const apiCenterNode = await ext.treeDataProvider.showTreeItemPicker<ApiCenterTreeItem>(ApiCenterTreeItem.contextValue, context);
        node = apiCenterNode.environmentsTreeItem;
    }

    if (!node) {
        return;
    }

    const apiEnvName = await vscode.window.showInputBox({
        title: UiStrings.EnterApiCenterEnvironmentName, prompt: UiStrings.InputValidEnvironemntName, ignoreFocusOut: true, validateInput: GeneralUtils.validateInputForTitle
    });

    if (!apiEnvName) {
        throw new UserCancelledError();
    }

    const envKind = await vscode.window.showQuickPick(Object.values(EnvironmentKind), { placeHolder: UiStrings.SelectEnvironmentKind });
    if (!envKind) {
        throw new UserCancelledError();
    }

    const serverType = await vscode.window.showQuickPick([ContinueToSkip, ...Object.values(ApiCenterEnvironmentServerType)], { placeHolder: UiStrings.SelectApicEnvironmentServerType });
    let serverProp = {};
    if (serverType != ContinueToSkip) {
        const serverEndpoint = await vscode.window.showInputBox({
            title: UiStrings.EnterApiCenterEnvironmentEndpoint, prompt: UiStrings.InputValidAPICEnvServerEndpoint, ignoreFocusOut: true, validateInput: GeneralUtils.validateURI
        });
        if (serverEndpoint) {
            serverProp = {
                type: serverType,
                managementPortalUri: [serverEndpoint]
            }
        }
    } else if (!serverType) {
        throw new UserCancelledError();
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: UiStrings.CreateEnvironmentProgressTitle,
    }, async (progress, token) => {
        const resourceGroupName = getResourceGroupFromId(node!.apiCenter.id);
        const apiCenterService = new ApiCenterService(node!.parent?.subscription!, resourceGroupName, node!.apiCenter.name);
        const apicEnv = {
            name: apiEnvName,
            properties: {
                kind: envKind,
                server: serverProp
            }
        }
        await apiCenterService.createOrUpdateApiCenterEnvironment(apicEnv as ApiCenterEnvironment);
        node!.refresh(context);
    });
}
