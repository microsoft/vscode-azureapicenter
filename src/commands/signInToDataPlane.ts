// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import { AzureDataSessionProviderHelper, generateScopes } from "../azure/azureLogin/dataSessionProvider";
import { ApisTreeItem } from "../tree/ApisTreeItem";
import { ApiServerItem } from "../tree/DataPlaneAccount";
export async function SignInToDataPlane(context: IActionContext, node: ApisTreeItem) {
    if (!(node instanceof ApisTreeItem)) {
        let parentNode = (node as ApisTreeItem).parent as ApiServerItem;
        let scopes = generateScopes(parentNode.subscription!.userId!, parentNode.subscription!.tenantId!)
        await AzureDataSessionProviderHelper.getSessionProvider().signIn(scopes);
    }
}
