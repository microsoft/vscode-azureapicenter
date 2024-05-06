// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterApiVersionDefinition } from "../azure/ApiCenter/contracts";

export class ApiVersionDefinitionTreeItem extends AzExtTreeItem {
  public static contextValue: string = "azureApiCenterApiVersionDefinitionTreeItem";
  public readonly contextValue: string = ApiVersionDefinitionTreeItem.contextValue;
  constructor(
    parent: AzExtParentTreeItem,
    public apiCenterName: string,
    public apiCenterApiName: string,
    public apiCenterApiVersionName: string,
    public apiCenterApiVersionDefinition: ApiCenterApiVersionDefinition) {
    super(parent);
    this.contextValue += "-" + apiCenterApiVersionDefinition.properties.specification.name.toLowerCase();
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("list-selection");
  }

  public get id(): string {
    return this.apiCenterApiVersionDefinition.id;
  }

  public get label(): string {
    return this.apiCenterApiVersionDefinition.properties.title;
  }
}
