// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as path from "path";
import * as vscode from "vscode";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { treeUtils } from "../utils/treeUtils";
const degit = require('degit');
export async function generateMCPSSE(context: IActionContext,
    node?: ApiVersionDefinitionTreeItem): Promise<void> {
    if (!node) {
        node = await treeUtils.getDefinitionTreeNode(context);
    }
    if (!node) {
        return;
    }
    const homePath = path.join(process.env.HOME || process.env.USERPROFILE || "", node.label);
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(homePath));
    vscode.window.showInformationMessage(`Directory created at: ${homePath}`);
    const emitter = degit('Azure-Samples/remote-mcp-functions-typescript', {
        cache: false,
        force: true,
        verbose: true
    });

    await emitter.clone(homePath);
    vscode.window.showInformationMessage(`Template cloned into: ${homePath}`);

    const functionsPath = path.join(homePath, 'src', 'functions');
    const functionsUri = vscode.Uri.file(functionsPath);

    try {
        const files = await vscode.workspace.fs.readDirectory(functionsUri);
        for (const [fileName] of files) {
            const fileUri = vscode.Uri.file(path.join(functionsPath, fileName));
            await vscode.workspace.fs.delete(fileUri, { recursive: true, useTrash: false });
        }
        vscode.window.showInformationMessage(`All files in 'functions' directory have been removed.`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to remove files in 'functions' directory: ${(error as Error).message}`);
    }


    // const listRepairSourcePath = path.join(__dirname, './listRepair');
    const listRepairSourcePath = path.join(getTemplatesFolder(), 'project', 'listRepair.ts');
    const listRepairDestinationPath = path.join(functionsPath, 'listRepair.ts');
    const listRepairSourceUri = vscode.Uri.file(listRepairSourcePath);
    const listRepairDestinationUri = vscode.Uri.file(listRepairDestinationPath);

    try {
        await vscode.workspace.fs.copy(listRepairSourceUri, listRepairDestinationUri, { overwrite: true });
        vscode.window.showInformationMessage(`'listRepair' file has been copied to 'functions' directory as 'listRepair.ts'.`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy 'listRepair' file: ${(error as Error).message}`);
    }

    const tasksSourcePath = path.join(getTemplatesFolder(), 'project', 'tasks.json');
    const tasksDestinationPath = path.join(homePath, '.vscode', 'tasks.json');
    const tasksSourceUri = vscode.Uri.file(tasksSourcePath);
    const tasksDestinationUri = vscode.Uri.file(tasksDestinationPath);

    try {
        await vscode.workspace.fs.createDirectory(vscode.Uri.file(path.join(homePath, '.vscode')));
        await vscode.workspace.fs.copy(tasksSourceUri, tasksDestinationUri, { overwrite: true });
        vscode.window.showInformationMessage(`'tasks.json' file has been copied to '.vscode' directory.`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy 'tasks.json' file: ${(error as Error).message}`);
    }

    const mcpSourcePath = path.join(getTemplatesFolder(), 'project', 'mcp.json');
    const vscodeDirectoryPath = path.join(homePath, '.vscode');
    const mcpDestinationPath = path.join(vscodeDirectoryPath, 'mcp.json');
    const mcpSourceUri = vscode.Uri.file(mcpSourcePath);
    const mcpDestinationUri = vscode.Uri.file(mcpDestinationPath);

    try {
        await vscode.workspace.fs.createDirectory(vscode.Uri.file(vscodeDirectoryPath));
        await vscode.workspace.fs.copy(mcpSourceUri, mcpDestinationUri, { overwrite: true });
        vscode.window.showInformationMessage(`'mcp.json' file has been copied to '.vscode' directory.`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to copy 'mcp.json' file: ${(error as Error).message}`);
    }

    const uri = vscode.Uri.file(homePath);
    await vscode.commands.executeCommand('vscode.openFolder', uri, true);
}

function getTemplatesFolder(): string {
    return path.join(__dirname, "..", "templates");
}
