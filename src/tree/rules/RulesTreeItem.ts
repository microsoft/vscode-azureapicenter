// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as path from 'path';
import * as vscode from 'vscode';
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../../azure/ApiCenter/contracts";
import { UiStrings } from "../../uiStrings";
import { getFilenamesInFolder, hasFiles, pathExists } from "../../utils/fsUtil";
import { GeneralUtils } from "../../utils/generalUtils";
import { upzip } from "../../utils/zipUtils";
import { FunctionsTreeItem } from "./FunctionsTreeItem";
import { RuleTreeItem } from "./RuleTreeItem";

const functionsDir = "functions";
const rulesDir = ".api-center-rules";
const validRuleFileNames = ["ruleset.yml", "ruleset.yaml", "ruleset.json"];

export class RulesTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterRules";
    public contextValue: string = RulesTreeItem.contextValue;
    public rulesFolderPath: string = "";
    constructor(parent: AzExtParentTreeItem, public apiCenter: ApiCenter, public configName: string) {
        super(parent);
    }

    public get label(): string {
        return this.configName;
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("symbol-ruler");
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        this.rulesFolderPath = this.getRulesFolderPath();

        if (!await hasFiles(this.rulesFolderPath)) {
            await this.exportRulesToLocalFolder(this.rulesFolderPath);
        }

        const filenames = await getFilenamesInFolder(this.rulesFolderPath);
        const ruleFilename = filenames.find((filename) => validRuleFileNames.includes(filename.toLowerCase()));

        if (!ruleFilename) {
            throw new Error(vscode.l10n.t(UiStrings.NoRuleFileFound, validRuleFileNames.join("' or '"), this.rulesFolderPath));
        }

        const ruleFullFilePath = path.join(this.rulesFolderPath, ruleFilename);
        const functionsFolderPath = path.join(this.rulesFolderPath, functionsDir);
        let functionsFilenames: string[] = [];
        if (await pathExists(functionsFolderPath)) {
            functionsFilenames = await getFilenamesInFolder(functionsFolderPath);
        }

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

        const { value } = await apiCenterService.exportRuleset(this.configName);
        const zipFileContent = Buffer.from(value, 'base64');

        await upzip(zipFileContent, rulesFolderPath);
    }

    public getRulesFolderPath(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const workspacePath = workspaceFolders ? workspaceFolders[0].uri.fsPath : GeneralUtils.getApiCenterWorkspacePath();
        return path.join(workspacePath, rulesDir, this.apiCenter.name, this.configName);
    }
}
