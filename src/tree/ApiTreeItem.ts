// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterApi } from "../azure/ApiCenter/contracts";
import { UiStrings } from "../uiStrings";
import { ApiDeploymentsTreeItem } from "./ApiDeploymentsTreeItem";
import { ApiVersionsTreeItem } from "./ApiVersionsTreeItem";

export class ApiTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiTreeItemChildTypeLabel;
  public static contextValue: string = "azureApiCenterApi";
  public readonly contextValue: string = ApiTreeItem.contextValue;
  public readonly apiVersionsTreeItem: ApiVersionsTreeItem;
  public readonly apiDeploymentsTreeItem: ApiDeploymentsTreeItem;
  private readonly _apiCenterApi: ApiCenterApi;
  private readonly _apiCenterName: string;
  private _nextLink: string | undefined;
  constructor(parent: AzExtParentTreeItem, apiCenterName: string, apiCenterApi: ApiCenterApi) {
    super(parent);
    this._apiCenterName = apiCenterName;
    this._apiCenterApi = apiCenterApi;
    this.apiVersionsTreeItem = new ApiVersionsTreeItem(this, apiCenterName, apiCenterApi);
    this.apiDeploymentsTreeItem = new ApiDeploymentsTreeItem(this, apiCenterName, apiCenterApi);
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("library");
  }

  public get id(): string {
    return this._apiCenterApi.id;
  }

  public get label(): string {
    return this._apiCenterApi.properties.title;
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    return [this.apiVersionsTreeItem, this.apiDeploymentsTreeItem];
  }
}
