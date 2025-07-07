// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { IEnvironmentsBase } from "../azure/ApiCenterDefines/ApiCenterEnvironment";
import { UiStrings } from "../uiStrings";
import { EnvironmentTreeItem } from "./EnvironmentTreeItem";

export class EnvironmentsTreeItem extends AzExtParentTreeItem {
  public static contextValue: string = "azureApiCenterEnvironments";
  public readonly contextValue: string = EnvironmentsTreeItem.contextValue;
  private _nextLink: string | undefined;
  constructor(parent: AzExtParentTreeItem, private _apiCenterName: string, public apiEnvironments: IEnvironmentsBase) {
    super(parent);
  }
  public get label(): string {
    return UiStrings.TreeitemLabelEnvironments;
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("symbol-method");
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    const apis = await this.apiEnvironments.getChild(this.parent?.subscription!, this._apiCenterName);
    return await this.createTreeItemsWithErrorHandling(
      apis,
      'invalidResource',
      resource => new EnvironmentTreeItem(this, this.apiEnvironments.generateChild(resource)),
      resource => resource.name
    );
  }

  public hasMoreChildrenImpl(): boolean {
    return this.apiEnvironments.getNextLink() !== undefined;
  }
}
