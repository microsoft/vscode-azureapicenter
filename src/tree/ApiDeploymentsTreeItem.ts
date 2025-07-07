// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { IDeploymentsBase } from "../azure/ApiCenterDefines/ApiCenterDeployment";
import { ApiDeploymentTreeItem } from "./ApiDeploymentTreeItem";
export class ApiDeploymentsTreeItem extends AzExtParentTreeItem {
  public static contextValue: string = "azureApiCenterApiDeployments";
  public readonly contextValue: string = ApiDeploymentsTreeItem.contextValue;
  private readonly _apiCenterDeployments: IDeploymentsBase;
  private readonly _apiCenterName: string;
  constructor(parent: AzExtParentTreeItem, apiCenterName: string, apiDeployments: IDeploymentsBase) {
    super(parent);
    this._apiCenterName = apiCenterName;
    this._apiCenterDeployments = apiDeployments;
  }

  public get iconPath(): TreeItemIconPath {
    return new vscode.ThemeIcon("server");
  }

  public get label(): string {
    return "Deployments";
  }

  public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
    const apis = await this._apiCenterDeployments.getChild(this.parent?.subscription!, this._apiCenterName);

    return await this.createTreeItemsWithErrorHandling(
      apis,
      'invalidResource',
      resource => new ApiDeploymentTreeItem(this, this._apiCenterDeployments.generateChild(resource)),
      resource => resource.name
    );
  }

  public hasMoreChildrenImpl(): boolean {
    return this._apiCenterDeployments.getNextLink() !== undefined;
  }
}
