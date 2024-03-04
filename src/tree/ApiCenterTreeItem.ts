// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenter } from "../azure/ResourceGraph/contracts";
import { ApisTreeItem } from "./ApisTreeItem";
import { EnvironmentsTreeItem } from "./EnvironmentsTreeItem";
import { treeUtils } from "../utils/treeUtils";

export class ApiCenterTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenter";
    public readonly contextValue: string = ApiCenterTreeItem.contextValue;
    private readonly _apicenter: ApiCenter;
    private _nextLink: string | undefined;
    public readonly apisTreeItem: ApisTreeItem;
    public readonly environmentsTreeItem: EnvironmentsTreeItem;
    constructor(parent: AzExtParentTreeItem, apicenter: ApiCenter) {
      super(parent);
      this._apicenter = apicenter;
      this.apisTreeItem = new ApisTreeItem(this, apicenter);
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
      return [this.apisTreeItem, this.environmentsTreeItem];
    }
  }