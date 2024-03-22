// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../azure/ApiCenter/contracts";
import { UiStrings } from "../uiStrings";
import { treeUtils } from "../utils/treeUtils";
import { ApiTreeItem } from "./ApiTreeItem";

export class ApisTreeItem extends AzExtParentTreeItem {
  public static contextValue: string = "azureApiCenterApis";
  public searchContext: string = "";
  public contextValue: string = ApisTreeItem.contextValue;
  private _nextLink: string | undefined;
  constructor(parent: AzExtParentTreeItem, public apiCenter: ApiCenter) {
    super(parent);
  }

  public get iconPath(): TreeItemIconPath {
    return treeUtils.getIconPath('list');
  }

  public get label(): string {
    return UiStrings.TreeitemLabelApi;
  }

  public cleanUpSearch(context: IActionContext): void {
    this.searchContext = "";
    this.description = "";
    this.refresh(context);
    this.contextValue = ApisTreeItem.contextValue;
  }

  public updateSearchContent(context: string): void {
    this.contextValue = ApisTreeItem.contextValue + "-search";
    this.searchContext = context;
    this.description = `Search Result: ${context}`;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    const resourceGroupName = getResourceGroupFromId(this.apiCenter.id);
    const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this.apiCenter.name);
    const apis = await apiCenterService.getApiCenterApis(this.searchContext);

    this._nextLink = apis.nextLink;
    return await this.createTreeItemsWithErrorHandling(
      apis.value,
      'invalidResource',
      resource => new ApiTreeItem(this, this.apiCenter.name, resource),
      resource => resource.name
    );
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }
}
