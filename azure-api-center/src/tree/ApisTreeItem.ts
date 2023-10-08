import { AzExtParentTreeItem, AzExtTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenter, ApiCenterApi } from "../azure/ApiCenter/contracts";
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiTreeItem } from "./ApiTreeItem";

export class ApisTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterApis";
    public readonly contextValue: string = ApisTreeItem.contextValue;
    private readonly _apiCenter: ApiCenter;
    private _nextLink: string | undefined;
    constructor(parent: AzExtParentTreeItem, apicenter: ApiCenter) {
      super(parent);
      this._apiCenter = apicenter;
    }

    public get label(): string {
      return "Apis";
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
      const resourceGroupName = getResourceGroupFromId(this._apiCenter.id);
      const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this._apiCenter.name);
      const apis = await apiCenterService.getApiCenterApis();

      this._nextLink = apis.nextLink;
      return await this.createTreeItemsWithErrorHandling(
          apis.value,
          'invalidResource',
          resource => new ApiTreeItem(this, resource),
          resource => resource.name
      );
    }

    public hasMoreChildrenImpl(): boolean {
      return this._nextLink !== undefined;
    }
  }