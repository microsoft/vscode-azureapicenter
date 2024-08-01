// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { IDefinitionBase } from "../azure/ApiCenter/ApiCenterDefinition";
export class ApiVersionDefinitionTreeItem extends AzExtTreeItem {
  public static contextValue: string = "azureApiCenterApiVersionDefinitionTreeItem";
  public static dataPlaneContextValue: string = "azureApiCenterApiVersionDataPlaneDefinitionTreeItem"
  public readonly contextValue: string = ApiVersionDefinitionTreeItem.contextValue;
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
