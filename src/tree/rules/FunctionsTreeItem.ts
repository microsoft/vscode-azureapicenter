// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { FunctionTreeItem } from "./FunctionTreeItem";

export class FunctionsTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterFunctions";
    public readonly contextValue: string = FunctionsTreeItem.contextValue;
    private readonly _functionNames: string[];
    constructor(parent: AzExtParentTreeItem, functionNames: string[]) {
        super(parent);
        this._functionNames = functionNames;
    }

    public get label(): string {
        return "Functions";
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("file-directory");
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        return this._functionNames.map((functionName) => new FunctionTreeItem(this, functionName));
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
}
