// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterApiDeployment } from "../azure/ApiCenter/contracts";

export class ApiDeploymentTreeItem extends AzExtTreeItem {
  public static contextValue: string = "azureApiCenterApiDeployment";
  public readonly contextValue: string = ApiDeploymentTreeItem.contextValue;
  private readonly _apiCenterApiDeployment: ApiCenterApiDeployment;
  constructor(parent: AzExtParentTreeItem, apiCenterApiDeployment: ApiCenterApiDeployment) {
    super(parent);
    this._apiCenterApiDeployment = apiCenterApiDeployment;
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("server");
  }

  public get id(): string {
    return this._apiCenterApiDeployment.id;
  }

  public get label(): string {
    return this._apiCenterApiDeployment.name;
  }
}
