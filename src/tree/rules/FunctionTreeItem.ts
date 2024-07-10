// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';

export class FunctionTreeItem extends AzExtTreeItem {
    public static contextValue: string = "azureApiCenterFunction";
    public readonly contextValue: string = FunctionTreeItem.contextValue;
    private readonly _functionName: string;
    constructor(parent: AzExtParentTreeItem, functionName: string) {
        super(parent);
        this._functionName = functionName;
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("file-code");
    }

    public get label(): string {
        return this._functionName;
    }
}
