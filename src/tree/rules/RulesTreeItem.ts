// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as path from 'path';
import * as vscode from 'vscode';
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../../azure/ApiCenter/contracts";
import { UiStrings } from "../../uiStrings";
import { getFilenamesInFolder, hasFiles, writeToTemporaryFile } from "../../utils/fsUtil";
import { upzip } from "../../utils/zipUtils";
import { FunctionsTreeItem } from "./FunctionsTreeItem";
import { RuleTreeItem } from "./RuleTreeItem";

const functionsDir = "functions";

export class RulesTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterRules";
    public readonly contextValue: string = RulesTreeItem.contextValue;
    public rulesFolderPath: string = "";
    private readonly _isEnabled: boolean;
    constructor(parent: AzExtParentTreeItem, public apiCenter: ApiCenter, isEnabled: boolean = false) {
        super(parent);
        this._isEnabled = isEnabled;
    }

    public get label(): string {
        return "Rules";
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("symbol-ruler");
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        this.rulesFolderPath = this.getRulesFolderPath();

        if (!await hasFiles(this.rulesFolderPath)) {
            await this.exportRulesToLocalFolder(this.rulesFolderPath);
        }

        const ruleFilename = (await getFilenamesInFolder(this.rulesFolderPath))[0];
        const ruleFullFilePath = path.join(this.rulesFolderPath, ruleFilename);
        const functionsFilenames = await getFilenamesInFolder(path.join(this.rulesFolderPath, functionsDir));

        return [
            new RuleTreeItem(this, this.rulesFolderPath, ruleFullFilePath, ruleFilename),
            new FunctionsTreeItem(this, this.rulesFolderPath, ruleFullFilePath, functionsDir, functionsFilenames),
        ];
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }

    public async exportRulesToLocalFolder(rulesFolderPath: string): Promise<void> {
        const resourceGroupName = getResourceGroupFromId(this.apiCenter.id);
        const apiCenterService = new ApiCenterService(this.parent?.subscription!, resourceGroupName, this.apiCenter.name);

        const { value } = await apiCenterService.exportRuleset();
        const zipFileContent = Buffer.from(value, 'base64');

        const zipFileUri = await writeToTemporaryFile(zipFileContent, "rules", `${this.apiCenter.name}.zip`);

        await upzip(zipFileUri.fsPath, rulesFolderPath);
    }

    public getRulesFolderPath(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error(UiStrings.NoFolderOpenedForRules);
        }
        return path.join(workspaceFolders[0].uri.fsPath, '.api-center-rules', this.apiCenter.name);
    }
}
