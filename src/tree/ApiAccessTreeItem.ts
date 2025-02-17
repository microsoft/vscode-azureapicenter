// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterApiAccess } from "../azure/ApiCenter/contracts";

export class ApiAccessTreeItem extends AzExtTreeItem {
  public static contextValue: string = "azureApiCenterApiAccess";
  public readonly contextValue: string = ApiAccessTreeItem.contextValue;
  constructor(parent: AzExtParentTreeItem, public apiCenterApiAccess: ApiCenterApiAccess) {
    super(parent);
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("key");
  }

  public get id(): string {
    return this.apiCenterApiAccess.id;
  }

  public get label(): string {
    return this.apiCenterApiAccess.name;
  }
}
