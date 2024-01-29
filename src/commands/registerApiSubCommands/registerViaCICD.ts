import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { CICDType } from "../../constants";

function getTemplatesFolder(): string {
    return path.join(__dirname, "..", "templates");
}

const stringResources = {
    azurepipelines: ".azure-pipelines",
    github: ".github",
    workflows: "workflows",
    sourceYaml: "cd.yml",
    targetYaml: "register-api.yml",
}

export async function registerViaCICD(context: IActionContext) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        throw new Error("Please open a project to generate CI/CD file.");
    }
    const selectType = await vscode.window.showQuickPick(Object.values(CICDType), { title: 'Select CI/CD provider', ignoreFocusOut: true });
    if (selectType) {
        const projectFolder = workspaceFolders[0];
        const workspacePath: string = projectFolder.uri.fsPath;
        let targetWorkflowPath: string = "";
        if (selectType === CICDType.github) {
            targetWorkflowPath = path.join(workspacePath, stringResources.github, stringResources.workflows);
        } else {
            targetWorkflowPath = path.join(workspacePath, stringResources.azurepipelines);
        }
        await fs.ensureDir(targetWorkflowPath);
        const srcFilePath = path.join(getTemplatesFolder(), selectType.replace(/\s/g, ""), stringResources.sourceYaml);
        const targetFilePath = path.join(targetWorkflowPath, stringResources.targetYaml);
        await fs.copyFile(srcFilePath, targetFilePath);
        vscode.workspace.openTextDocument(targetFilePath).then((document) => {
            void vscode.window.showTextDocument(document);
        });
    }
}
