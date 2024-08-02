// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../azure/ApiCenter/contracts";
import { ApiCenterApisManagement } from "../azure/ApiCenterDefines/ApiCenterApi";
import { UiStrings } from "../uiStrings";
import { treeUtils } from "../utils/treeUtils";
import { ApisTreeItem } from "./ApisTreeItem";
import { EnvironmentsTreeItem } from "./EnvironmentsTreeItem";
import { RulesTreeItem } from "./rules/RulesTreeItem";
export class ApiCenterTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiCenterTreeItemTreeItemChildTypeLabel;
  public static contextValue: string = "azureApiCenter";
  public readonly contextValue: string = ApiCenterTreeItem.contextValue;
  private readonly _apicenter: ApiCenter;
  private _nextLink: string | undefined;
  public readonly apisTreeItem: ApisTreeItem;
  public readonly environmentsTreeItem: EnvironmentsTreeItem;
  public rulesTreeItem: RulesTreeItem | undefined;
  constructor(parent: AzExtParentTreeItem, apicenter: ApiCenter) {
    super(parent);
    this._apicenter = apicenter;
    this.apisTreeItem = new ApisTreeItem(this, new ApiCenterApisManagement(apicenter));
    this.environmentsTreeItem = new EnvironmentsTreeItem(this, apicenter);
  }

  public get iconPath(): TreeItemIconPath {
    return treeUtils.getIconPath('apiCenter');
  }

  public get id(): string {
    return this._apicenter.id;
  }

  public get label(): string {
    return this._apicenter.name;
  }

  public hasMoreChildrenImpl(): boolean {
    return this._nextLink !== undefined;
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    const resourceGroupName = getResourceGroupFromId(this._apicenter.id);
    const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this._apicenter.name);

    const isApiCenterRulesetEnabled = await apiCenterService.isApiCenterRulesetEnabled();

    this.rulesTreeItem = new RulesTreeItem(this, this._apicenter, isApiCenterRulesetEnabled);

    return [this.apisTreeItem, this.environmentsTreeItem, this.rulesTreeItem];
  }
}
