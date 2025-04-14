// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import * as vscode from 'vscode';


export class McpToolTreeItem extends AzExtTreeItem {
    public static contextValue: string = "mcpTool";
    public contextValue: string = McpToolTreeItem.contextValue;
    constructor(
        parent: AzExtParentTreeItem,
        public mcpClient: Client,
        public toolName: string,
        public toolDescription: string | undefined,
        public toolInputSchema: any,
    ) {
        super(parent);
    }

    public get label(): string {
        return this.toolName;
    }

    public get description(): string {
        return this.toolDescription ?? "";
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("tools");
    }
}
