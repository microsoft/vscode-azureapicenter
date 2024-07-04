// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtTreeItem, IActionContext, openUrl } from '@microsoft/vscode-azext-utils';
import { AzureAccountCreateUrl, AzureAccountType } from "../constants";

export async function openUrlFromTreeNode(context: IActionContext, node?: AzExtTreeItem) {
    switch (node?.id) {
        case AzureAccountType.createAzureAccount: {
            await openUrl(AzureAccountCreateUrl.createAzureAccountUrl);
            break;
        }
        case AzureAccountType.createAzureStudentAccount: {
            await openUrl(AzureAccountCreateUrl.createAzureStudentUrl);
            break;
        }
    }
}
