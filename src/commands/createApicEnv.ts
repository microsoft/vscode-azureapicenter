// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenterEnvironment, ApiCenterEnvironmentServerType, EnvironmentKind } from "../azure/ApiCenter/contracts";
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
        title: UiStrings.EnterApiCenterEnvironmentName, prompt: UiStrings.InputValidEnvironmentName, ignoreFocusOut: true, validateInput: GeneralUtils.validateInputForTitle
    });

    if (!apiEnvName) {
        throw new UserCancelledError();
    }

    const envKind = await vscode.window.showQuickPick(Object.values(EnvironmentKind), { placeHolder: UiStrings.SelectEnvironmentKind });
    if (!envKind) {
        throw new UserCancelledError();
    }
    const quickPickItems = [{
        label: UiStrings.ContinueWithoutSelecting,
    }, {
        label: "",
        kind: vscode.QuickPickItemKind.Separator
    }, ...Object.values(ApiCenterEnvironmentServerType).map((type) => {
        return {
            label: type
        };
    })];
    const serverType = await vscode.window.showQuickPick(quickPickItems, { placeHolder: UiStrings.SelectApicEnvironmentServerType });
    let serverProp = {};
    if (!serverType) {
        throw new UserCancelledError();
    }
    else if (serverType?.label !== UiStrings.ContinueWithoutSelecting) {
        const serverEndpoint = await vscode.window.showInputBox({
            title: UiStrings.EnterApiCenterEnvironmentEndpoint, prompt: UiStrings.InputValidAPICEnvServerEndpoint, ignoreFocusOut: true, validateInput: GeneralUtils.validateURI
        });
        if (serverEndpoint) {
            serverProp = {
                type: serverType,
                managementPortalUri: [serverEndpoint]
            };
        }
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
                kind: envKind.toLocaleLowerCase(),
                server: serverProp
            }
        };
        await apiCenterService.createOrUpdateApiCenterEnvironment(apicEnv as ApiCenterEnvironment);
        node!.refresh(context);
    });
}
