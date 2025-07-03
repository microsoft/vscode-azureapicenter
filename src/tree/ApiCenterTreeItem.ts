// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenter } from "../azure/ApiCenter/contracts";
import { ApiCenterApisManagement } from "../azure/ApiCenterDefines/ApiCenterApi";
import { UiStrings } from "../uiStrings";
import { treeUtils } from "../utils/treeUtils";
import { ApisTreeItem } from "./ApisTreeItem";
import { EnvironmentsTreeItem } from "./EnvironmentsTreeItem";
import { ProfilesTreeItem } from "./rules/ProfilesTreeItem";
import { RulesTreeItem } from "./rules/RulesTreeItem";
export class ApiCenterTreeItem extends AzExtParentTreeItem {
  public readonly childTypeLabel: string = UiStrings.ApiCenterTreeItemTreeItemChildTypeLabel;
  public static contextValue: string = "azureApiCenter";
  public readonly contextValue: string = ApiCenterTreeItem.contextValue;
  private readonly _apicenter: ApiCenter;
  private _nextLink: string | undefined;
  public readonly apisTreeItem: ApisTreeItem;
  public readonly environmentsTreeItem: EnvironmentsTreeItem;
  public readonly profilesTreeItem: ProfilesTreeItem;
  public rulesTreeItem: RulesTreeItem | undefined;
  constructor(parent: AzExtParentTreeItem, public apicenter: ApiCenter) {
    super(parent);
    this._apicenter = apicenter;
    this.apisTreeItem = new ApisTreeItem(this, new ApiCenterApisManagement(apicenter));
    this.environmentsTreeItem = new EnvironmentsTreeItem(this, apicenter);
    this.profilesTreeItem = new ProfilesTreeItem(this, apicenter);
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
    return [this.apisTreeItem, this.environmentsTreeItem, this.profilesTreeItem];
  }
}
