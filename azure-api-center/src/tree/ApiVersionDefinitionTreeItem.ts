import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenterApi, ApiCenterApiVersion, ApiCenterApiVersionDefinition } from "../azure/ApiCenter/contracts";
import { treeUtils } from "../utils/treeUtils";

export class ApiVersionDefinitionTreeItem extends AzExtTreeItem {
    public static contextValue: string = "azureApiCenterApiVersionDefinition";
    public readonly contextValue: string = ApiVersionDefinitionTreeItem.contextValue;
    private readonly _apiCenterApiVersionDefinition: ApiCenterApiVersionDefinition;
    constructor(
      parent: AzExtParentTreeItem, 
      apiCenterApiVersionDefinition: ApiCenterApiVersionDefinition) {
      super(parent);
      this._apiCenterApiVersionDefinition = apiCenterApiVersionDefinition;
    }
  
    public get iconPath(): TreeItemIconPath {
      return treeUtils.getIconPath('definition');
    }
  
    public get id(): string {
      return this._apiCenterApiVersionDefinition.id;
    }
  
    public get label(): string {
      return this._apiCenterApiVersionDefinition.name;
    }
  }