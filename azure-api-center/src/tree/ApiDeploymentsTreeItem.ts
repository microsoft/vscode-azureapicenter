import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenter, ApiCenterApi } from "../azure/ApiCenter/contracts";
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiTreeItem } from "./ApiTreeItem";
import { treeUtils } from "../utils/treeUtils";
import { ApiDeploymentTreeItem } from "./ApiDeploymentTreeItem";

export class ApiDeploymentsTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterApiDeployments";
    public readonly contextValue: string = ApiDeploymentsTreeItem.contextValue;
    private readonly _apiCenterApi: ApiCenterApi;
    private readonly _apiCenterName: string;
    private _nextLink: string | undefined;
    constructor(parent: AzExtParentTreeItem, apiCenterName: string, apiCenterApi: ApiCenterApi) {
      super(parent);
      this._apiCenterName = apiCenterName;
      this._apiCenterApi = apiCenterApi;
    }

    public get iconPath(): TreeItemIconPath {
      return treeUtils.getIconPath('list');
    }
    
    public get label(): string {
      return "Deployments";
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
      const resourceGroupName = getResourceGroupFromId(this._apiCenterApi.id);
      const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this._apiCenterName);
      const apis = await apiCenterService.getApiCenterApiDeployments(this._apiCenterApi.name);

      this._nextLink = apis.nextLink;
      return await this.createTreeItemsWithErrorHandling(
          apis.value,
          'invalidResource',
          resource => new ApiDeploymentTreeItem(this, resource),
          resource => resource.name
      );
    }

    public hasMoreChildrenImpl(): boolean {
      return this._nextLink !== undefined;
    }
  }