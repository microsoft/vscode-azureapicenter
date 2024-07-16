// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, AzExtTreeItem, GenericTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as path from 'path';
import * as vscode from 'vscode';
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../../azure/ApiCenter/contracts";
import { UiStrings } from "../../uiStrings";
import { getFilenamesInFolder, hasFiles } from "../../utils/fsUtil";
import { upzip } from "../../utils/zipUtils";
import { FunctionsTreeItem } from "./FunctionsTreeItem";
import { RuleTreeItem } from "./RuleTreeItem";

const functionsDir = "functions";

export class RulesTreeItem extends AzExtParentTreeItem {
    public static contextValue: string = "azureApiCenterRules";
    public contextValue: string = RulesTreeItem.contextValue;
    public rulesFolderPath: string = "";
    constructor(parent: AzExtParentTreeItem, public apiCenter: ApiCenter, public isEnabled: boolean) {
        super(parent);
        if (isEnabled) {
            this.contextValue = RulesTreeItem.contextValue + "-enabled";
        }
    }

    public get label(): string {
        return "Rules";
    }

    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("symbol-ruler");
    }

    public updateStatusToEnable(): void {
        this.contextValue = RulesTreeItem.contextValue + "-enabled";
        this.isEnabled = true;
    }

    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        if (!this.isEnabled) {
            const infoNode = new GenericTreeItem(this, {
                label: "Ruleset is not enabled. Click here to enable it.",
                commandId: "azure-api-center.enableRules",
                contextValue: "enableRules",
                iconPath: new vscode.ThemeIcon("info"),
            });
            infoNode.commandArgs = [this];
            return [infoNode];
        }

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

        await upzip(zipFileContent, rulesFolderPath);
    }

    public getRulesFolderPath(): string {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error(UiStrings.NoFolderOpenedForRules);
        }
        return path.join(workspaceFolders[0].uri.fsPath, '.api-center-rules', this.apiCenter.name);
    }
}
