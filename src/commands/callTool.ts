// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { McpToolTreeItem } from "../tree/mcp/McpToolTreeItem";

export async function callTool(context: IActionContext, node: McpToolTreeItem) {
    const toolArguments: string[] = Object.keys(node.toolInputSchema.properties);

    const toolInput: { [key: string]: any } = {};
    for (const argument of toolArguments) {
        toolInput[argument] = await vscode.window.showInputBox({ prompt: `Enter value for parameter '${argument}'` });
    }

    try {
        // const { tools } = await node.mcpClient.listTools();
        // vscode.window.showInformationMessage(`Available tools: ${tools.map(tool => tool.name).join(', ')}`);
        const result = await node.mcpClient.callTool({
            name: node.toolName,
            arguments: toolInput,
        });

        vscode.window.showInformationMessage(`Tool '${node.toolName}' called successfully.
Result: ${JSON.stringify(result)}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error calling tool ${node.toolName}: ${error}`);
        return;

    }
}
