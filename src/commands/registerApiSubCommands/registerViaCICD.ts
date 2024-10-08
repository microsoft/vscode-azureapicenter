// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { CICDType } from "../../constants";
import { UiStrings } from "../../uiStrings";

export namespace RegisterViaCICD {
    export function getTemplatesFolder(): string {
        return path.join(__dirname, "..", "templates");
    }

    const stringResources = {
        azurepipelines: ".azure-pipelines",
        github: ".github",
        workflows: "workflows",
        sourceYaml: "cd.yml",
        targetYaml: "register-api.yml",
    };

    export async function registerViaCICD(context: IActionContext) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error(UiStrings.OpenWorkspace);
        }
        const selectType = await vscode.window.showQuickPick(Object.values(CICDType), { title: UiStrings.SelectCiCdProvider, ignoreFocusOut: true });
        if (selectType) {
            const projectFolder = workspaceFolders[0];
            const workspacePath: string = projectFolder.uri.fsPath;
            let targetWorkflowPath, srcFilePath: string = "";
            if (selectType === CICDType.github) {
                targetWorkflowPath = path.join(workspacePath, stringResources.github, stringResources.workflows);
                srcFilePath = path.join(RegisterViaCICD.getTemplatesFolder(), stringResources.github, stringResources.sourceYaml);
            } else {
                targetWorkflowPath = path.join(workspacePath, stringResources.azurepipelines);
                srcFilePath = path.join(RegisterViaCICD.getTemplatesFolder(), stringResources.azurepipelines, stringResources.sourceYaml);
            }
            await fs.ensureDir(targetWorkflowPath);
            const targetFilePath = path.join(targetWorkflowPath, stringResources.targetYaml);
            await fs.copyFile(srcFilePath, targetFilePath);
            const document = await vscode.workspace.openTextDocument(targetFilePath);
            await vscode.window.showTextDocument(document);
        } else {
            throw new UserCancelledError();
        }
    }
}
