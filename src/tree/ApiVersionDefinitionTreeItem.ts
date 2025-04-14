// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { IDefinitionBase } from "../azure/ApiCenterDefines/ApiCenterDefinition";
import { McpToolsTreeItem } from "./mcp/McpToolsTreeItem";
export class ApiVersionDefinitionTreeItem extends AzExtParentTreeItem {
  public readonly contextValue: string = "";
  constructor(
    parent: AzExtParentTreeItem,
    public apiCenterName: string,
    public apiCenterApiName: string,
    public apiCenterApiVersionName: string,
    public apiCenterApiVersionDefinition: IDefinitionBase) {
    super(parent);
    this.contextValue = apiCenterApiVersionDefinition.getContext();
  }

  public get collapsibleState(): vscode.TreeItemCollapsibleState {
    if (this.label.toLocaleLowerCase().includes("mcp")) {
      return vscode.TreeItemCollapsibleState.Collapsed;
    } else {
      return vscode.TreeItemCollapsibleState.None;
    }
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("list-selection");
  }

  public get id(): string {
    return this.apiCenterApiVersionDefinition.getId();
  }

  public get label(): string {
    return this.apiCenterApiVersionDefinition.getLabel();
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    return [new McpToolsTreeItem(this, this.apiCenterName, this.apiCenterApiName, this.apiCenterApiVersionName, this.apiCenterApiVersionDefinition.getName())];
  }

  public hasMoreChildrenImpl(): boolean {
    return false;
  }
}
