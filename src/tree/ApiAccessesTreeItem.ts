// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { UiStrings } from "../uiStrings";
import { ApiAccessTreeItem } from "./ApiAccessTreeItem";

export class ApiAccessesTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiAccessesTreeItemChildTypeLabel;
  public static contextValue: string = "azureApiCenterApiAccesses";
  public readonly contextValue: string = ApiAccessesTreeItem.contextValue;
  private _nextLink: string | undefined;
  constructor(
    parent: AzExtParentTreeItem,
    public apiCenterName: string,
    public apiCenterApiName: string,
    public apiCenterApiVersionName: string) {
    super(parent);
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("key");
  }

  public get label(): string {
    return UiStrings.TreeitemLabelAccesses;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    const resourceGroupName = getResourceGroupFromId(this.parent?.id!);
    const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this.apiCenterName);
    let accesses = await apiCenterService.getApiCenterApiAccesses(this.apiCenterApiName, this.apiCenterApiVersionName);
    this._nextLink = accesses.nextLink;
    return await this.createTreeItemsWithErrorHandling(
      accesses.value,
      'invalidResource',
      access => new ApiAccessTreeItem(this, access),
      access => access.name
    );
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }
}
