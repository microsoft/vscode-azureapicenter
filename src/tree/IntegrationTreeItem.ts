// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenter, ApiCenterApiSource } from "../azure/ApiCenter/contracts";

export class IntegrationTreeItem extends AzExtTreeItem {
    public static contextValue: string = "azureApiCenterIntegration";
    public readonly contextValue: string = IntegrationTreeItem.contextValue;
    constructor(parent: AzExtParentTreeItem, public apiCenter: ApiCenter, public apiSource: ApiCenterApiSource) {
        super(parent);
    }

    public get label(): string {
        return this.apiSource.name;
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("link");
    }

    public get description(): string {
        return this.apiSource.properties.linkState.state;
    }
}
