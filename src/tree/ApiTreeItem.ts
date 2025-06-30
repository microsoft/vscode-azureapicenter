// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterApiManagement, IApiCenterApiBase } from "../azure/ApiCenterDefines/ApiCenterApi";
import { UiStrings } from "../uiStrings";
import { ApiDeploymentsTreeItem } from "./ApiDeploymentsTreeItem";
import { ApiVersionsTreeItem } from "./ApiVersionsTreeItem";
export class ApiTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiTreeItemChildTypeLabel;
  public static contextValue: string = "azureApiCenterApi";
  public readonly contextValue: string = ApiTreeItem.contextValue;
  public readonly apiVersionsTreeItem: ApiVersionsTreeItem;
  public readonly apiDeploymentsTreeItem?: ApiDeploymentsTreeItem;
  private readonly _apiCenterApi: IApiCenterApiBase;
  private readonly _apiCenterName: string;
  constructor(parent: AzExtParentTreeItem, apiCenterName: string, apiCenterApi: IApiCenterApiBase) {
    super(parent);
    this._apiCenterName = apiCenterName;
    this._apiCenterApi = apiCenterApi;
    this.description = this._apiCenterApi.getType().toLowerCase();
    this.apiVersionsTreeItem = new ApiVersionsTreeItem(this, apiCenterName, apiCenterApi.generateChild());
    if (apiCenterApi instanceof ApiCenterApiManagement) {
      this.apiDeploymentsTreeItem = new ApiDeploymentsTreeItem(this, apiCenterName, (apiCenterApi as ApiCenterApiManagement).getData());
    }
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("library");
  }

  public get id(): string {
    return this._apiCenterApi.getId();
  }

  public get label(): string {
    return this._apiCenterApi.getLabel();
  }

  public hasMoreChildrenImpl(): boolean {
    return this._apiCenterApi.getNextLink() !== undefined;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    return this.apiDeploymentsTreeItem ? [this.apiVersionsTreeItem, this.apiDeploymentsTreeItem] : [this.apiVersionsTreeItem];
  }
}
