// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';

export class RuleTreeItem extends AzExtTreeItem {
    public static contextValue: string = "azureApiCenterRule";
    public readonly contextValue: string = RuleTreeItem.contextValue;
    private readonly _ruleName: string;
    constructor(parent: AzExtParentTreeItem, ruleName: string) {
        super(parent);
        this._ruleName = ruleName;
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("book");
    }

    public get label(): string {
        return this._ruleName;
    }
}
