// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { GeneralApiCenterApi } from "../azure/ApiCenter/contracts";
import { UiStrings } from "../uiStrings";
import { ApiDeploymentsTreeItem } from "./ApiDeploymentsTreeItem";
import { ApiVersionsTreeItem } from "./ApiVersionsTreeItem";

export class ApiTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiTreeItemChildTypeLabel;
  public static contextValue: string = "azureApiCenterApi";
  public readonly contextValue: string = ApiTreeItem.contextValue;
  public readonly apiVersionsTreeItem: ApiVersionsTreeItem;
  public readonly apiDeploymentsTreeItem?: ApiDeploymentsTreeItem;
  private readonly _apiCenterApi: GeneralApiCenterApi;
  private readonly _apiCenterName: string;
  private _nextLink: string | undefined;
  constructor(parent: AzExtParentTreeItem, apiCenterName: string, apiCenterApi: GeneralApiCenterApi) {
    super(parent);
    this._apiCenterName = apiCenterName;
    this._apiCenterApi = apiCenterApi;
    this.apiVersionsTreeItem = new ApiVersionsTreeItem(this, apiCenterName, apiCenterApi);
    if ('id' in apiCenterApi) {
      this.apiDeploymentsTreeItem = new ApiDeploymentsTreeItem(this, apiCenterName, apiCenterApi);
    }
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("library");
  }

  public get id(): string {
    return 'id' in this._apiCenterApi ? this._apiCenterApi.id : this._apiCenterApi.name;
  }

  public get label(): string {
    return 'id' in this._apiCenterApi ? this._apiCenterApi.properties.title : this._apiCenterApi.title;
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    return this.apiDeploymentsTreeItem ? [this.apiVersionsTreeItem, this.apiDeploymentsTreeItem] : [this.apiVersionsTreeItem];
  }
}
