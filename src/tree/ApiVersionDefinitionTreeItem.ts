// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { GeneralApiCenterApiVersionDefinition } from "../azure/ApiCenter/contracts";

export class ApiVersionDefinitionTreeItem extends AzExtTreeItem {
  public static contextValue: string = "azureApiCenterApiVersionDefinitionTreeItem";
  public static dataPlaneContextValue: string = "azureApiCenterApiVersionDataPlaneDefinitionTreeItem"
  public readonly contextValue: string = ApiVersionDefinitionTreeItem.contextValue;
  constructor(
    parent: AzExtParentTreeItem,
    public apiCenterName: string,
    public apiCenterApiName: string,
    public apiCenterApiVersionName: string,
    public apiCenterApiVersionDefinition: GeneralApiCenterApiVersionDefinition) {
    super(parent);
    if ('id' in apiCenterApiVersionDefinition) {
      this.contextValue += "-" + apiCenterApiVersionDefinition.properties.specification.name.toLowerCase();
    } else {
      this.contextValue = ApiVersionDefinitionTreeItem.dataPlaneContextValue + "-" + apiCenterApiVersionDefinition.name.toLowerCase();
    }
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("list-selection");
  }

  public get id(): string {
    return 'id' in this.apiCenterApiVersionDefinition ? this.apiCenterApiVersionDefinition.id : this.apiCenterApiVersionDefinition.name
  }

  public get label(): string {
    return 'id' in this.apiCenterApiVersionDefinition ? this.apiCenterApiVersionDefinition.properties.title : this.apiCenterApiVersionDefinition.name;
  }
}
