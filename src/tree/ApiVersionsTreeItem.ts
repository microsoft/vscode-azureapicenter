// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { IApiCenterBase } from "../azure/ApiCenter/ApiCenterDefinition";
import { UiStrings } from "../uiStrings";
import { ApiVersionTreeItem } from "./ApiVersionTreeItem";

export class ApiVersionsTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiVersionsChildTypeLabel;
  public static contextValue: string = "azureApiCenterApiVersions";
  public readonly contextValue: string = ApiVersionsTreeItem.contextValue;
  private readonly _apiCenterName: string;
  private readonly _apiCenterApi: IApiCenterBase;
  constructor(parent: AzExtParentTreeItem, apiCenterName: string, apiCenterApi: IApiCenterBase) {
    super(parent);
    this._apiCenterName = apiCenterName;
    this._apiCenterApi = apiCenterApi;
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("versions");
  }

  public get label(): string {
    return UiStrings.TreeitemLabelVersions;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    const apis = await this._apiCenterApi.getChild(this.parent?.subscription!, this._apiCenterName);
    return await this.createTreeItemsWithErrorHandling(
      apis,
      'invalidResource',
      resource => new ApiVersionTreeItem(this, this._apiCenterName, this._apiCenterApi.getName(), this._apiCenterApi.generateChild(resource)),
      resource => resource.name
    );
  }

  public hasMoreChildrenImpl(): boolean {
    return this._apiCenterApi.getNextLink() !== undefined;
  }
}
