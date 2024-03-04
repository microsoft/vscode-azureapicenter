// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenter } from "../azure/ApiCenter/contracts";
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { EnvironmentTreeItem } from "./EnvironmentTreeItem";
import { treeUtils } from "../utils/treeUtils";

export class EnvironmentsTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterEnvironments";
    public readonly contextValue: string = EnvironmentsTreeItem.contextValue;
    private readonly _apiCenter: ApiCenter;
    private _nextLink: string | undefined;
    constructor(parent: AzExtParentTreeItem, apicenter: ApiCenter) {
      super(parent);
      this._apiCenter = apicenter;
    }
    public get label(): string {
      return "Environments";
    }

    public get iconPath(): TreeItemIconPath {
      return treeUtils.getIconPath('list');
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
      const resourceGroupName = getResourceGroupFromId(this._apiCenter.id);
      const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this._apiCenter.name);
      const apis = await apiCenterService.getApiCenterEnvironments();

      this._nextLink = apis.nextLink;
      return await this.createTreeItemsWithErrorHandling(
          apis.value,
          'invalidResource',
          resource => new EnvironmentTreeItem(this, resource),
          resource => resource.name
      );
    }

    public hasMoreChildrenImpl(): boolean {
      return this._nextLink !== undefined;
    }
  }