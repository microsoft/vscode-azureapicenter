// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { IApiCenterServiceBase } from "../azure/ApiCenter/ApiCenterDefinition";
import { UiStrings } from "../uiStrings";
import { ApiTreeItem } from "./ApiTreeItem";
export class ApisTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApisTreeItemChildTypeLabel;
  public static contextValue: string = "azureApiCenterApis";
  public searchContent: string = "";
  public contextValue: string = ApisTreeItem.contextValue;
  private _nextLink: string | undefined;
  constructor(parent: AzExtParentTreeItem, public apiCenter: IApiCenterServiceBase) {
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
    const apis = await this.apiCenter.getChild(this.parent?.subscription!, this.searchContent);
    return await this.createTreeItemsWithErrorHandling(
      apis,
      'invalidResource',
      resource => new ApiTreeItem(this, this.apiCenter.getName(), this.apiCenter.generateChild(resource)),
      resource => resource.name
    );
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }
}
