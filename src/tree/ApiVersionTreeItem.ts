// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenterApiVersion } from "../azure/ApiCenter/contracts";
import { UiStrings } from "../uiStrings";
import { treeUtils } from "../utils/treeUtils";
import { ApiVersionDefinitionsTreeItem } from "./ApiVersionDefinitionsTreeItem";

export class ApiVersionTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiVersionChildTypeLabel;
  public static contextValue: string = "azureApiCenterApiVersion";
  public readonly contextValue: string = ApiVersionTreeItem.contextValue;
  private readonly _apiCenterApiVersion: ApiCenterApiVersion;
  public readonly apiVersionDefinitionsTreeItem: ApiVersionDefinitionsTreeItem;
  private _nextLink: string | undefined;
  constructor(
    parent: AzExtParentTreeItem,
    apiCenterName: string,
    apiCenterApiName: string,
    apiCenterApiVersion: ApiCenterApiVersion) {
    super(parent);
    this._apiCenterApiVersion = apiCenterApiVersion;
    this.apiVersionDefinitionsTreeItem = new ApiVersionDefinitionsTreeItem(this, apiCenterName, apiCenterApiName, apiCenterApiVersion);
  }

  public get iconPath(): TreeItemIconPath {
    return treeUtils.getIconPath('version');
  }

  public get id(): string {
    return this._apiCenterApiVersion.id;
  }

  public get label(): string {
    return this._apiCenterApiVersion.properties.title;
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    return [this.apiVersionDefinitionsTreeItem];
  }
}
