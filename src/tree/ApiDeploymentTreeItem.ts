// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterApi, ApiCenterApiDeployment } from "../azure/ApiCenter/contracts";

export class ApiDeploymentTreeItem extends AzExtTreeItem {
  public static contextValue: string = "azureApiCenterApiDeployment";
  public readonly contextValue: string = ApiDeploymentTreeItem.contextValue;
  constructor(
    parent: AzExtParentTreeItem,
    public apiCenterName: string,
    public apiCenterApi: ApiCenterApi,
    public apiCenterApiDeployment: ApiCenterApiDeployment) {
    super(parent);
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("server");
  }

  public get id(): string {
    return this.apiCenterApiDeployment.id;
  }

  public get label(): string {
    return this.apiCenterApiDeployment.name;
  }
}
