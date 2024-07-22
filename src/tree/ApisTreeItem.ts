// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterDataPlaneService } from "../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { GeneralApiCenter, GeneralApiCenterApi, isApiServerManagement } from "../azure/ApiCenter/contracts";
import { UiStrings } from "../uiStrings";
import { ApiTreeItem } from "./ApiTreeItem";
export class ApisTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApisTreeItemChildTypeLabel;
  public static contextValue: string = "azureApiCenterApis";
  public searchContent: string = "";
  public contextValue: string = ApisTreeItem.contextValue;
  private _nextLink: string | undefined;
  constructor(parent: AzExtParentTreeItem, public apiCenter: GeneralApiCenter) {
    super(parent);
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("library");
  }

  public get label(): string {
    return UiStrings.TreeitemLabelApis;
  }

  public cleanUpSearch(context: IActionContext): void {
    this.searchContent = "";
    this.description = "";
    this.contextValue = ApisTreeItem.contextValue;
    this.refresh(context);
  }

  public updateSearchContent(searchContent: string): void {
    this.contextValue = ApisTreeItem.contextValue + "-search";
    this.searchContent = searchContent;
    this.description = vscode.l10n.t(UiStrings.SearchAPIsResult, searchContent);
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    const apis = await this.getApis();
    return await this.createTreeItemsWithErrorHandling(
      apis,
      'invalidResource',
      resource => new ApiTreeItem(this, this.apiCenter.name, resource),
      resource => resource.name
    );
  }

  private async getApis(): Promise<GeneralApiCenterApi[]> {
    if (isApiServerManagement(this.apiCenter)) {
      const resourceGroupName = getResourceGroupFromId(this.apiCenter.id);
      const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this.apiCenter.name);
      const apis = await apiCenterService.getApiCenterApis(this.searchContent);

      this._nextLink = apis.nextLink;
      return apis.value;
    } else {
      let server = new ApiCenterDataPlaneService(this.parent?.subscription!);
      const res = await server.getApiCenterApis();
      this._nextLink = res.nextLink;
      return res.value;
    }
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }
}
