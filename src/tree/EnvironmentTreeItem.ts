// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { IEnvironmentBase } from "../azure/ApiCenterDefines/ApiCenterEnvironment";

export class EnvironmentTreeItem extends AzExtTreeItem {
  public static contextValue: string = "azureApiCenterEnvironment";
  public readonly contextValue: string = EnvironmentTreeItem.contextValue;
  private readonly _apiCenterEnv: IEnvironmentBase;
  constructor(parent: AzExtParentTreeItem, apiCenterEnv: IEnvironmentBase) {
    super(parent);
    this._apiCenterEnv = apiCenterEnv;
    this.description = this._apiCenterEnv.getKind();
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("symbol-method");
  }

  public get id(): string {
    return this._apiCenterEnv.getId();
  }

  public get label(): string {
    return this._apiCenterEnv.getName();
  }
}
