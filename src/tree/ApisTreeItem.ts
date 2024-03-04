// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenter, ApiCenterApi } from "../azure/ApiCenter/contracts";
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiTreeItem } from "./ApiTreeItem";
import { treeUtils } from "../utils/treeUtils";

export class ApisTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterApis";
    public readonly contextValue: string = ApisTreeItem.contextValue;
    private _nextLink: string | undefined;
    constructor(parent: AzExtParentTreeItem, public apiCenter: ApiCenter) {
      super(parent);
    }

    public get iconPath(): TreeItemIconPath {
      return treeUtils.getIconPath('list');
    }
    
    public get label(): string {
      return "Apis";
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
      const resourceGroupName = getResourceGroupFromId(this.apiCenter.id);
      const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this.apiCenter.name);
      const apis = await apiCenterService.getApiCenterApis();

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