// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { FunctionTreeItem } from "./FunctionTreeItem";

export class FunctionsTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterFunctions";
    public readonly contextValue: string = FunctionsTreeItem.contextValue;
    constructor(parent: AzExtParentTreeItem, public rulesFolderPath: string, public functionsDir: string, public functionNames: string[]) {
        super(parent);
    }

    public get label(): string {
        return "Functions";
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("file-directory");
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        return this.functionNames.map((functionName) => new FunctionTreeItem(this, this.rulesFolderPath, this.functionsDir, functionName));
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
}
