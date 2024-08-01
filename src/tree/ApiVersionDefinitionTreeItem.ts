// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { IDefinitionBase } from "../azure/ApiCenter/ApiCenterDefinition";
export class ApiVersionDefinitionTreeItem extends AzExtTreeItem {
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

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("list-selection");
  }

  public get id(): string {
    return this.apiCenterApiVersionDefinition.getId();
  }

  public get label(): string {
    return this.apiCenterApiVersionDefinition.getLabel();
  }
}
