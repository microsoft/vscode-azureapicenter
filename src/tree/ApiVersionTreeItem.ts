// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { GeneralApiCenterApiVersion, isApiVersionManagement } from "../azure/ApiCenter/contracts";
import { UiStrings } from "../uiStrings";
import { ApiVersionDefinitionsTreeItem } from "./ApiVersionDefinitionsTreeItem";

export class ApiVersionTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiVersionChildTypeLabel;
  public static contextValue: string = "azureApiCenterApiVersion";
  public readonly contextValue: string = ApiVersionTreeItem.contextValue;
  private readonly _apiCenterApiVersion: GeneralApiCenterApiVersion;
  public readonly apiVersionDefinitionsTreeItem: ApiVersionDefinitionsTreeItem;
  private _nextLink: string | undefined;
  constructor(
    parent: AzExtParentTreeItem,
    apiCenterName: string,
    apiCenterApiName: string,
    apiCenterApiVersion: GeneralApiCenterApiVersion) {
    super(parent);
    this._apiCenterApiVersion = apiCenterApiVersion;
    this.apiVersionDefinitionsTreeItem = new ApiVersionDefinitionsTreeItem(this, apiCenterName, apiCenterApiName, apiCenterApiVersion);
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("versions");
  }

  public get id(): string {
    return isApiVersionManagement(this._apiCenterApiVersion) ? this._apiCenterApiVersion.id : this._apiCenterApiVersion.name;
  }

  public get label(): string {
    return isApiVersionManagement(this._apiCenterApiVersion) ? this._apiCenterApiVersion.properties.title : this._apiCenterApiVersion.title;
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    return [this.apiVersionDefinitionsTreeItem];
  }
}
