// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import { ApiCenterEnvironment } from "../azure/ApiCenter/contracts";
import { treeUtils } from "../utils/treeUtils";

export class EnvironmentTreeItem extends AzExtTreeItem {
    public static contextValue: string = "azureApiCenterEnvironment";
    public readonly contextValue: string = EnvironmentTreeItem.contextValue;
    private readonly _apiCenterEnv: ApiCenterEnvironment;
    constructor(parent: AzExtParentTreeItem, apiCenterEnv: ApiCenterEnvironment) {
      super(parent);
      this._apiCenterEnv = apiCenterEnv;
    }
  
    public get iconPath(): TreeItemIconPath {
      return treeUtils.getIconPath('env');
    }
    
    public get id(): string {
      return this._apiCenterEnv.id;
    }
  
    public get label(): string {
      return this._apiCenterEnv.name;
    }
  }