// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { ext } from "../../extensionVariables";
import { RulesTreeItem } from "../../tree/rules/RulesTreeItem";
const fs = require('fs').promises;
const path = require('path');


export async function exportRules(context: IActionContext, node: RulesTreeItem) {
    const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        openLabel: "Select Folder to Export Rules",
    });

    if (fileUri && fileUri[0]) {
        await copyFolderRecursiveAsync(path.join(ext.context.extensionPath, "test-rules"), fileUri[0].fsPath);
        vscode.window.showInformationMessage(`Rules exported to ${fileUri[0].fsPath}`);
    }

}

async function copyFolderRecursiveAsync(source: string, destination: string) {
    try {
        // Check if the destination directory exists, if not, create it
        await fs.mkdir(destination, { recursive: true });

        // Read all the items (files and directories) from the source directory
        const items = await fs.readdir(source, { withFileTypes: true });

        for (const item of items) {
            const srcPath = path.join(source, item.name);
            const destPath = path.join(destination, item.name);

            if (item.isDirectory()) {
                // If the item is a directory, recursively call this function
                await copyFolderRecursiveAsync(srcPath, destPath);
            } else {
                // If the item is a file, copy it to the destination directory
                await fs.copyFile(srcPath, destPath);
            }
        }
    } catch (error) {
        console.error('Error occurred while copying folder:', error);
    }
}
