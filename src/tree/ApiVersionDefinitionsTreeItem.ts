// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { IDefinitionsBase } from "../azure/ApiCenterDefines/ApiCenterDefinition";
import { UiStrings } from "../uiStrings";
import { ApiVersionDefinitionTreeItem } from "./ApiVersionDefinitionTreeItem";
export class ApiVersionDefinitionsTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiVersionDefinitionsTreeItemChildTypeLabel;
  public static contextValue: string = "azureApiCenterApiVersionDefinitions";
  public readonly contextValue: string = ApiVersionDefinitionsTreeItem.contextValue;
  private readonly _apiCenterName: string;
  private readonly _apiCenterApiName: string;
  private readonly _apiCenterApiVersion: IDefinitionsBase;
  constructor(
    parent: AzExtParentTreeItem,
    apiCenterName: string,
    apiCenterApiName: string,
    apiCenterApiVersion: IDefinitionsBase) {
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
    let definitions = await this._apiCenterApiVersion.getChild(this.parent?.subscription!, this._apiCenterName, this._apiCenterApiName);
    return await this.createTreeItemsWithErrorHandling(
      definitions,
      'invalidResource',
      definition => new ApiVersionDefinitionTreeItem(
        this,
        this._apiCenterName,
        this._apiCenterApiName,
        this._apiCenterApiVersion.getName(),
        this._apiCenterApiVersion.generateChild(definition)),
      definition => definition.name
    );
  }

  public hasMoreChildrenImpl(): boolean {
    return this._apiCenterApiVersion.getNextLink() !== undefined;
  }
}
