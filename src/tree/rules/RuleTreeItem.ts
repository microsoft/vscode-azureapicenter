// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as path from 'path';
import * as vscode from 'vscode';

export class RuleTreeItem extends AzExtTreeItem {
    public static contextValue: string = "azureApiCenterRule";
    public readonly contextValue: string = RuleTreeItem.contextValue;
    public readonly fullFilePath: string;
    constructor(parent: AzExtParentTreeItem, public rulesFolderPath: string, public ruleName: string) {
        super(parent);
        this.fullFilePath = path.join(rulesFolderPath, ruleName);
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("book");
    }

    public get label(): string {
        return this.ruleName;
    }

    public get commandId(): string {
        return 'azure-api-center.openRule';
    }
}
