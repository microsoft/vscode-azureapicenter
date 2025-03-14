// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import generateApiSpecFromCodeProjectPrompt from "../prompts/generateApiSpecFromCodeProject";

export async function generateApiSpecFromCodeProject(context: IActionContext) {
    const query = generateApiSpecFromCodeProjectPrompt();
    await vscode.commands.executeCommand('workbench.action.chat.open', {
        query
    });
}
