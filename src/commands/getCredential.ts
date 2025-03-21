// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ext } from "../extensionVariables";
import { ApiAccessTreeItem } from "../tree/ApiAccessTreeItem";
import { UiStrings } from "../uiStrings";

export async function getCredential(context: IActionContext, node: ApiAccessTreeItem) {
    const resourceGroupName = getResourceGroupFromId(node.id);
    const apiCenterService = new ApiCenterService(node.parent?.subscription!, resourceGroupName, node.apiCenterName);

    const credential = await apiCenterService.getApiCenterApiCredential(node.apiCenterApiName, node.apiCenterApiVersionName, node.apiCenterApiAccess.name);

    ext.outputChannel.appendLine(vscode.l10n.t(UiStrings.CredentialFor, node.apiCenterApiAccess.name));
    ext.outputChannel.appendLine(JSON.stringify(credential, null, 2));
    ext.outputChannel.show(true);
}
