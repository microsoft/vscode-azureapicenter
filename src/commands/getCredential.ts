// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ext } from "../extensionVariables";
import { ApiAccessTreeItem } from "../tree/ApiAccessTreeItem";

export async function getCredential(context: IActionContext, node: ApiAccessTreeItem) {
    // vscode.window.showInformationMessage(`Getting credential for ${node.apiCenterApiAccess.name}`);

    const resourceGroupName = getResourceGroupFromId(node.id);
    const apiCenterService = new ApiCenterService(node.parent?.subscription!, resourceGroupName, node.apiCenterName);

    const credential = await apiCenterService.getApiCenterApiCredential(node.apiCenterApiName, node.apiCenterApiVersionName, node.apiCenterApiAccess.name);

    // vscode.window.showInformationMessage(`Credential for ${node.apiCenterApiAccess.name} is ${credential.apiKey?.value}`);

    // const document = await vscode.workspace.openTextDocument({
    //     content: JSON.stringify(credential, null, 2),
    //     language: 'json'
    // });
    // await vscode.window.showTextDocument(document);

    ext.outputChannel.appendLine(`Credential for '${node.apiCenterApiAccess.name}':`);
    ext.outputChannel.appendLine(JSON.stringify(credential, null, 2));
    ext.outputChannel.show(true);
}
