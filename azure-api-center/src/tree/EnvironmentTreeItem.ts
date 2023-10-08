import { AzExtParentTreeItem, AzExtTreeItem } from "@microsoft/vscode-azext-utils";
import { ApiCenterEnvironment } from "../azure/ApiCenter/contracts";

export class EnvironmentTreeItem extends AzExtTreeItem {
    public static contextValue: string = "azureApiCenterEnvironment";
    public readonly contextValue: string = EnvironmentTreeItem.contextValue;
    private readonly _apiCenterEnv: ApiCenterEnvironment;
    constructor(parent: AzExtParentTreeItem, apiCenterEnv: ApiCenterEnvironment) {
      super(parent);
      this._apiCenterEnv = apiCenterEnv;
    }
  
    public get id(): string {
      return this._apiCenterEnv.id;
    }
  
    public get label(): string {
      return this._apiCenterEnv.name;
    }
  }