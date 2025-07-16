// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../azure/ApiCenter/contracts";
import { UiStrings } from "../uiStrings";
import { IntegrationTreeItem } from "./IntegrationTreeItem";


export class IntegrationsTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterIntegrations";
    public contextValue: string = IntegrationsTreeItem.contextValue;
    private _nextLink: string | undefined;
    constructor(parent: AzExtParentTreeItem, public apiCenter: ApiCenter) {
        super(parent);
    }

    public get label(): string {
        return UiStrings.TreeitemLabelIntegrations;
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("link");
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const resourceGroupName = getResourceGroupFromId(this.apiCenter.id);
        const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this.apiCenter.name);

        const integrations = await apiCenterService.getApiCenterIntegrations();
        this._nextLink = integrations.nextLink;

        return await this.createTreeItemsWithErrorHandling(
            integrations.value,
            'invalidResource',
            integration => new IntegrationTreeItem(this, this.apiCenter, integration),
            integration => integration.name
        );
    }

    public hasMoreChildrenImpl(): boolean {
        return this._nextLink !== undefined;
    }
}
