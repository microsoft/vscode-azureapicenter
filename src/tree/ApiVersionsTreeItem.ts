// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenterApi } from "../azure/ApiCenter/contracts";
import { UiStrings } from "../uiStrings";
import { treeUtils } from "../utils/treeUtils";
import { ApiVersionTreeItem } from "./ApiVersionTreeItem";

export class ApiVersionsTreeItem extends AzExtParentTreeItem {
  public static contextValue: string = "azureApiCenterApiVersions";
  public readonly contextValue: string = ApiVersionsTreeItem.contextValue;
  private _nextLink: string | undefined;
  private readonly _apiCenterName: string;
  private readonly _apiCenterApi: ApiCenterApi;
  constructor(parent: AzExtParentTreeItem, apiCenterName: string, apiCenterApi: ApiCenterApi) {
    super(parent);
    this._apiCenterName = apiCenterName;
    this._apiCenterApi = apiCenterApi;
  }

  public get iconPath(): TreeItemIconPath {
    return treeUtils.getIconPath('list');
  }

  public get label(): string {
    return UiStrings.TreeitemLabelVersions;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    const resourceGroupName = getResourceGroupFromId(this._apiCenterApi.id);
    const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this._apiCenterName);
    const apis = await apiCenterService.getApiCenterApiVersions(this._apiCenterApi.name);

    this._nextLink = apis.nextLink;
    return await this.createTreeItemsWithErrorHandling(
      apis.value,
      'invalidResource',
      resource => new ApiVersionTreeItem(this, this._apiCenterName, this._apiCenterApi.name, resource),
      resource => resource.name
    );
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }
}
