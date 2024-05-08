// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenterApiVersion } from "../azure/ApiCenter/contracts";
import { UiStrings } from "../uiStrings";
import { ApiVersionDefinitionTreeItem } from "./ApiVersionDefinitionTreeItem";

export class ApiVersionDefinitionsTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiVersionDefinitionsTreeItemChildTypeLabel;
  public static contextValue: string = "azureApiCenterApiVersionDefinitions";
  public readonly contextValue: string = ApiVersionDefinitionsTreeItem.contextValue;
  private readonly _apiCenterName: string;
  private readonly _apiCenterApiName: string;
  private readonly _apiCenterApiVersion: ApiCenterApiVersion;
  private _nextLink: string | undefined;
  constructor(
    parent: AzExtParentTreeItem,
    apiCenterName: string,
    apiCenterApiName: string,
    apiCenterApiVersion: ApiCenterApiVersion) {
    super(parent);
    this._apiCenterApiVersion = apiCenterApiVersion;
    this._apiCenterName = apiCenterName;
    this._apiCenterApiName = apiCenterApiName;
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("list-selection");
  }

  public get label(): string {
    return UiStrings.TreeitemLabelDefinitions;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    const resourceGroupName = getResourceGroupFromId(this._apiCenterApiVersion.id);
    const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this._apiCenterName);

    const definitions = await apiCenterService.getApiCenterApiVersionDefinitions(this._apiCenterApiName, this._apiCenterApiVersion.name);

    this._nextLink = definitions.nextLink;
    return await this.createTreeItemsWithErrorHandling(
      definitions.value,
      'invalidResource',
      resource => new ApiVersionDefinitionTreeItem(
        this,
        this._apiCenterName,
        this._apiCenterApiName,
        this._apiCenterApiVersion.name,
        resource),
      resource => resource.name
    );
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }
}
