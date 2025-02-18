// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiAccessTreeItem } from "../tree/ApiAccessTreeItem";

export async function getCredential(context: IActionContext, node: ApiAccessTreeItem) {
    vscode.window.showInformationMessage(`Getting credential for ${node.apiCenterApiAccess.name}`);

    const resourceGroupName = getResourceGroupFromId(node.id);
    const apiCenterService = new ApiCenterService(node.parent?.subscription!, resourceGroupName, node.apiCenterName);

    const credential = await apiCenterService.getApiCenterApiCredential(node.apiCenterApiName, node.apiCenterApiVersionName, node.apiCenterApiAccess.name);

    vscode.window.showInformationMessage(`Credential for ${node.apiCenterApiAccess.name} is ${credential.apiKey?.value}`);
}
