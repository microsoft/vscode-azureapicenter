// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { IDeploymentBase } from "../azure/ApiCenterDefines/ApiCenterDeployment";

export class ApiDeploymentTreeItem extends AzExtTreeItem {
  public readonly contextValue: string;
  constructor(
    parent: AzExtParentTreeItem,
    public apiCenterApiDeployment: IDeploymentBase) {
    super(parent);
    this.contextValue = apiCenterApiDeployment.getContext();
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("server");
  }

  public get id(): string {
    return this.apiCenterApiDeployment.getId()!;
  }

  public get label(): string {
    return this.apiCenterApiDeployment.getName();
  }
}
