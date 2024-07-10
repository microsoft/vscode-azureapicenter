// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../../azure/ApiCenter/contracts";
import { FunctionsTreeItem } from "./FunctionsTreeItem";
import { RuleTreeItem } from "./RuleTreeItem";

export class RulesTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterRules";
    public readonly contextValue: string = RulesTreeItem.contextValue;
    public readonly _apiCenter: ApiCenter;
    private readonly _isEnabled: boolean;
    constructor(parent: AzExtParentTreeItem, public apicenter: ApiCenter, isEnabled: boolean = false) {
        super(parent);
        this._apiCenter = apicenter;
        this._isEnabled = isEnabled;
    }

    public get label(): string {
        return "Rules";
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("symbol-ruler");
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const resourceGroupName = getResourceGroupFromId(this._apiCenter.id);
        const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this._apiCenter.name);
        const rules = await apiCenterService.getApiCenterRules();

        return [
            new RuleTreeItem(this, rules.value.name),
            new FunctionsTreeItem(this, rules.value.functions.map(f => f.name)),
        ];
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
}
