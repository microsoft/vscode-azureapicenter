// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../azure/ApiCenter/contracts";
import { UiStrings } from "../uiStrings";
import { EnvironmentTreeItem } from "./EnvironmentTreeItem";

export class EnvironmentsTreeItem extends AzExtParentTreeItem {
  public static contextValue: string = "azureApiCenterEnvironments";
  public readonly contextValue: string = EnvironmentsTreeItem.contextValue;
  private _nextLink: string | undefined;
  constructor(parent: AzExtParentTreeItem, public apiCenter: ApiCenter) {
    super(parent);
  }
  public get label(): string {
    return UiStrings.TreeitemLabelEnvironments;
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("symbol-method");
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    const resourceGroupName = getResourceGroupFromId(this.apiCenter.id);
    const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this.apiCenter.name);
    const apis = await apiCenterService.getApiCenterEnvironments();

    this._nextLink = apis.nextLink;
    return await this.createTreeItemsWithErrorHandling(
      apis.value,
      'invalidResource',
      resource => new EnvironmentTreeItem(this, resource),
      resource => resource.name
    );
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }
}
