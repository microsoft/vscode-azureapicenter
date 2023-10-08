import { AzExtParentTreeItem, AzExtTreeItem } from "@microsoft/vscode-azext-utils";
import { ApiCenter } from "../azure/ResourceGraph/contracts";

export class ApiCenterTreeItem extends AzExtTreeItem {
    public static contextValue: string = "azureApiCenter";
    public readonly contextValue: string = ApiCenterTreeItem.contextValue;
    private readonly _apicenter: ApiCenter;
    constructor(parent: AzExtParentTreeItem, apicenter: ApiCenter) {
      super(parent);
      this._apicenter = apicenter;
    }
  
    public get id(): string {
      return this._apicenter.id;
    }
  
    public get label(): string {
      return this._apicenter.name;
    }
  }