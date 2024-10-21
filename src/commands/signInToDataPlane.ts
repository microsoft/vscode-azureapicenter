// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import { AzureDataSessionProviderHelper, generateScopes } from "../azure/azureLogin/dataSessionProvider";
import { ApisTreeItem } from "../tree/ApisTreeItem";
export async function SignInToDataPlane(context: IActionContext, node: ApisTreeItem) {
    const scopes = generateScopes(node.parent?.subscription!.userId!, node.parent?.subscription!.tenantId!);
    await AzureDataSessionProviderHelper.getSessionProvider().signIn(scopes);
}
