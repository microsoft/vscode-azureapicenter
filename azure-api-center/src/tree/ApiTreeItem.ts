import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenterApi } from "../azure/ApiCenter/contracts";
import { treeUtils } from "../utils/treeUtils";

export class ApiTreeItem extends AzExtTreeItem {
    public static contextValue: string = "azureApiCenterApi";
    public readonly contextValue: string = ApiTreeItem.contextValue;
    private readonly _apiCenterApi: ApiCenterApi;
    constructor(parent: AzExtParentTreeItem, apiCenterApi: ApiCenterApi) {
      super(parent);
      this._apiCenterApi = apiCenterApi;
    }
  
    public get iconPath(): TreeItemIconPath {
      return treeUtils.getIconPath('api');
    }
  
    public get id(): string {
      return this._apiCenterApi.id;
    }
  
    public get label(): string {
      return this._apiCenterApi.name;
    }
  }