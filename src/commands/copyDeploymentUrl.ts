// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { ApiDeploymentTreeItem } from "../tree/ApiDeploymentTreeItem";

export async function copyDeploymentUrl(context: IActionContext, node: ApiDeploymentTreeItem) {
    const runtimeUrl = node.apiCenterApiDeployment.properties.server.runtimeUri[0];

    await vscode.env.clipboard.writeText(runtimeUrl);
    vscode.window.showInformationMessage(`Runtime URL copied: ${runtimeUrl}`);
}
