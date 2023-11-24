import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenterApi, ApiCenterApiDeployment } from "../azure/ApiCenter/contracts";
import { treeUtils } from "../utils/treeUtils";

export class ApiDeploymentTreeItem extends AzExtTreeItem {
    public static contextValue: string = "azureApiCenterApiDeployment";
    public readonly contextValue: string = ApiDeploymentTreeItem.contextValue;
    private readonly _apiCenterApiDeployment: ApiCenterApiDeployment;
    constructor(parent: AzExtParentTreeItem, apiCenterApiDeployment: ApiCenterApiDeployment) {
      super(parent);
      this._apiCenterApiDeployment = apiCenterApiDeployment;
    }
  
    public get iconPath(): TreeItemIconPath {
      return treeUtils.getIconPath('deployment');
    }
  
    public get id(): string {
      return this._apiCenterApiDeployment.id;
    }
  
    public get label(): string {
      return this._apiCenterApiDeployment.name;
    }
  }