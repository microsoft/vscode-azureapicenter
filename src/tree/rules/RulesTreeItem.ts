// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as path from 'path';
import * as vscode from 'vscode';
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../../azure/ApiCenter/contracts";
import { getFilenamesInFolder } from "../../utils/fsUtil";
import { getRulesFolderPath } from "../../utils/ruleUtils";
import { upzip } from "../../utils/zipUtils";
import { FunctionsTreeItem } from "./FunctionsTreeItem";
import { RuleTreeItem } from "./RuleTreeItem";

const functionsDir = "functions";

export class RulesTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterRules";
    public readonly contextValue: string = RulesTreeItem.contextValue;
    private readonly _apiCenter: ApiCenter;
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

        const rulesFolderPath = await getRulesFolderPath(this._apiCenter.name);
        await upzip("C:\\code\\vscode-azureapicenter\\test-rules\\Ruleset.zip", rulesFolderPath);

        const ruleFilename = (await getFilenamesInFolder(rulesFolderPath))[0];
        const functionsFilenames = await getFilenamesInFolder(path.join(rulesFolderPath, functionsDir));

        return [
            new RuleTreeItem(this, rulesFolderPath, ruleFilename),
            new FunctionsTreeItem(this, rulesFolderPath, functionsDir, functionsFilenames),
        ];
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
}
