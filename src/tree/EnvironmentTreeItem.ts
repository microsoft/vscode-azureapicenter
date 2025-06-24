// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterEnvironment } from "../azure/ApiCenter/contracts";

export class EnvironmentTreeItem extends AzExtTreeItem {
  public static contextValue: string = "azureApiCenterEnvironment";
  public readonly contextValue: string = EnvironmentTreeItem.contextValue;
  private readonly _apiCenterEnv: ApiCenterEnvironment;
  constructor(parent: AzExtParentTreeItem, apiCenterEnv: ApiCenterEnvironment) {
    super(parent);
    this._apiCenterEnv = apiCenterEnv;
    this.description = this._apiCenterEnv.properties?.kind || "";
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("symbol-method");
  }

  public get id(): string {
    return this._apiCenterEnv.id;
  }

  public get label(): string {
    return this._apiCenterEnv.name;
  }
}
