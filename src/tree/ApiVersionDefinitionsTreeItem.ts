// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterDataPlaneService } from "../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { GeneralApiCenterApiVersion, GeneralApiCenterApiVersionDefinition } from "../azure/ApiCenter/contracts";
import { UiStrings } from "../uiStrings";
import { ApiVersionDefinitionTreeItem } from "./ApiVersionDefinitionTreeItem";

export class ApiVersionDefinitionsTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiVersionDefinitionsTreeItemChildTypeLabel;
  public static contextValue: string = "azureApiCenterApiVersionDefinitions";
  public readonly contextValue: string = ApiVersionDefinitionsTreeItem.contextValue;
  private readonly _apiCenterName: string;
  private readonly _apiCenterApiName: string;
  private readonly _apiCenterApiVersion: GeneralApiCenterApiVersion;
  private _nextLink: string | undefined;
  constructor(
    parent: AzExtParentTreeItem,
    apiCenterName: string,
    apiCenterApiName: string,
    apiCenterApiVersion: GeneralApiCenterApiVersion) {
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

    let difinitions = await this.getDefinitions();

    return await this.createTreeItemsWithErrorHandling(
      difinitions,
      'invalidResource',
      difinition => new ApiVersionDefinitionTreeItem(
        this,
        this._apiCenterName,
        this._apiCenterApiName,
        this._apiCenterApiVersion.name,
        difinition),
      difinition => difinition.name
    );
  }

  private async getDefinitions(): Promise<GeneralApiCenterApiVersionDefinition[]> {
    if ('id' in this._apiCenterApiVersion) {
      const resourceGroupName = getResourceGroupFromId(this._apiCenterApiVersion.id);
      const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this._apiCenterName);

      const definitions = await apiCenterService.getApiCenterApiVersionDefinitions(this._apiCenterApiName, this._apiCenterApiVersion.name);
      this._nextLink = definitions.nextLink;
      return definitions.value;
    } else {
      const server = new ApiCenterDataPlaneService(this.parent?.subscription!);
      const res = await server.getApiCenterApiDefinitions(this._apiCenterApiName, this._apiCenterApiVersion.name);
      this._nextLink = res.nextLink;
      return res.value;
    }
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }
}
