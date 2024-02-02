import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenterApiVersionDefinition } from "../azure/ApiCenter/contracts";
import { treeUtils } from "../utils/treeUtils";

export class ApiVersionDefinitionTreeItem extends AzExtTreeItem {
  public static contextValue: string = "azureApiCenterApiVersionDefinitionTreeItem";
  public readonly contextValue: string = ApiVersionDefinitionTreeItem.contextValue;
  constructor(
    parent: AzExtParentTreeItem,
    public apiCenterName: string,
    public apiCenterApiName: string,
    public apiCenterApiVersionName: string,
    public apiCenterApiVersionDefinition: ApiCenterApiVersionDefinition) {
    super(parent);
    this.contextValue += "-" + apiCenterApiVersionDefinition.properties.specification.name.toLowerCase();
  }

  public get iconPath(): TreeItemIconPath {
    return treeUtils.getIconPath('definition');
  }

  public get id(): string {
    return this.apiCenterApiVersionDefinition.id;
  }

  public get label(): string {
    return this.apiCenterApiVersionDefinition.properties.title;
  }
}
