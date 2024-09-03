// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IActionContext } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { ApiVersionDefinitionTreeItem } from '../tree/ApiVersionDefinitionTreeItem';

export async function generateTestInsight(context: IActionContext, node: ApiVersionDefinitionTreeItem) {
    await vscode.commands.executeCommand("microsoft-testing.api.analyze");
}
