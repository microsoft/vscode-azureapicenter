// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { ApiDeploymentTreeItem } from "../tree/ApiDeploymentTreeItem";
import { UiStrings } from "../uiStrings";

export async function copyDeploymentUrl(context: IActionContext, node: ApiDeploymentTreeItem) {
    const runtimeUrls = node.apiCenterApiDeployment.getRuntimeUris()
    const runtimeUrl = runtimeUrls[0];

    await vscode.env.clipboard.writeText(runtimeUrl);
    vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.RuntimeUrlCopied, runtimeUrl));
}
