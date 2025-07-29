// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterVersionManagement, IVersionBase } from "../azure/ApiCenterDefines/ApiCenterVersion";
import { UiStrings } from "../uiStrings";
import { ApiAccessesTreeItem } from "./ApiAccessesTreeItem";
import { ApiVersionDefinitionsTreeItem } from "./ApiVersionDefinitionsTreeItem";
export class ApiVersionTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiVersionChildTypeLabel;
  public static contextValue: string = "azureApiCenterApiVersion";
  public readonly contextValue: string = ApiVersionTreeItem.contextValue;
  private readonly _apiCenterApiVersion: IVersionBase;
  public readonly apiVersionDefinitionsTreeItem: ApiVersionDefinitionsTreeItem;
  public readonly apiAccessesTreeItem?: ApiAccessesTreeItem;
  constructor(
    parent: AzExtParentTreeItem,
    apiCenterName: string,
    apiCenterApiName: string,
    apiCenterApiVersion: IVersionBase) {
    super(parent);
    this._apiCenterApiVersion = apiCenterApiVersion;
    this.apiVersionDefinitionsTreeItem = new ApiVersionDefinitionsTreeItem(this, apiCenterName, apiCenterApiName, apiCenterApiVersion.generateChild());
    if (apiCenterApiVersion instanceof ApiCenterVersionManagement) {
      this.apiAccessesTreeItem = new ApiAccessesTreeItem(this, apiCenterName, apiCenterApiName, apiCenterApiVersion.getName());
    }
    this.description = apiCenterApiVersion.getLifeCycle();
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("versions");
  }

  public get id(): string {
    return this._apiCenterApiVersion.getId();
  }

  public get label(): string {
    return this._apiCenterApiVersion.getLabel();
  }

  public hasMoreChildrenImpl(): boolean {
    return false;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    return this.apiAccessesTreeItem ? [this.apiVersionDefinitionsTreeItem, this.apiAccessesTreeItem] : [this.apiVersionDefinitionsTreeItem];
  }
}
