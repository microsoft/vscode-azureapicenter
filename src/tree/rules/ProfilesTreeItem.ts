// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../../azure/ApiCenter/contracts";
import { UiStrings } from "../../uiStrings";
import { RulesTreeItem } from "./RulesTreeItem";


export class ProfilesTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterProfiles";
    public contextValue: string = ProfilesTreeItem.contextValue;
    constructor(parent: AzExtParentTreeItem, public apiCenter: ApiCenter) {
        super(parent);
    }

    public get label(): string {
        return UiStrings.TreeitemLabelProfiles;
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("symbol-ruler");
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const resourceGroupName = getResourceGroupFromId(this.apiCenter.id);
        const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this.apiCenter.name);

        // Fetch analyzer configurations, default to an empty array if none are found
        const analyzerConfigs = (await apiCenterService.getApiCenterAnalyzerConfigs())?.value || [];

        return await this.createTreeItemsWithErrorHandling(
            analyzerConfigs,
            'invalidResource',
            analyzerConfig => new RulesTreeItem(this, this.apiCenter, analyzerConfig.name),
            analyzerConfig => analyzerConfig.name
        );
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
}
