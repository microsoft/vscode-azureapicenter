// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as path from 'path';
import * as vscode from 'vscode';

export class FunctionTreeItem extends AzExtTreeItem {
    public static contextValue: string = "azureApiCenterFunction";
    public readonly contextValue: string = FunctionTreeItem.contextValue;
    public readonly fullFilePath: string;
    constructor(parent: AzExtParentTreeItem, public rulesFolderPath: string, public functionsDir: string, public functionName: string) {
        super(parent);
        this.fullFilePath = path.join(rulesFolderPath, functionsDir, functionName);
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("file-code");
    }

    public get label(): string {
        return this.functionName;
    }

    public get commandId(): string {
        return 'azure-api-center.openRule';
    }
}
