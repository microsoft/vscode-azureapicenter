// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as crypto from "crypto";
import * as fs from "fs";
import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { extensionName, sessionFolderKey } from '../constants';
import { ext } from '../extensionVariables';

export async function writeToTemporaryFile(fileContent: string, folderName: string, fileName: string): Promise<vscode.Uri> {
    const folderPath = await createTemporaryFolder(folderName);
    const localFilePath: string = path.join(folderPath, fileName);
    await fse.ensureFile(localFilePath);

    const fileUri = vscode.Uri.file(localFilePath);
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(fileContent));

    return fileUri;
}

export async function createTemporaryFile(fileName: string): Promise<string> {
    // The extension globalStoragePath is a wellknown for vscode and will cleanup when extension gets uninstalled.
    const defaultWorkspacePath = path.join(ext.context.globalStoragePath, extensionName);
    await fse.ensureDir(defaultWorkspacePath);

    // Every vscode sessions will get a unique folder to works with the files
    // This folder will be deleted post vscode session.
    const sessionFolder = getSessionWorkingFolderName();
    const filePath: string = path.join(defaultWorkspacePath, sessionFolder, fileName);
    await fse.ensureFile(filePath);
    return filePath;
}

// make a function that creates a temporary folder
export async function createTemporaryFolder(folderName: string): Promise<string> {
    const defaultWorkspacePath = path.join(ext.context.globalStoragePath, extensionName);
    await fse.ensureDir(defaultWorkspacePath);

    const sessionFolder = getSessionWorkingFolderName();
    const folderPath: string = path.join(defaultWorkspacePath, sessionFolder, folderName);
    await fse.ensureDir(folderPath);
    return folderPath;
}

export function getSessionWorkingFolderName(): string {
    let sessionFolderName = ext.context.globalState.get(sessionFolderKey);
    // tslint:disable-next-line: strict-boolean-expressions
    if (!sessionFolderName) {
        sessionFolderName = getRandomHexString();
        ext.outputChannel.appendLine(`Session working folder:${sessionFolderName}`);
        ext.context.globalState.update(sessionFolderKey, sessionFolderName);
    }

    return <string>sessionFolderName;
}

export function getRandomHexString(length: number = 10): string {
    const buffer: Buffer = crypto.randomBytes(Math.ceil(length / 2));
    return buffer.toString('hex').slice(0, length);
}

export function getDefaultWorkspacePath(): string {
    return path.join(ext.context.globalStoragePath, extensionName);
}

export async function getFilenamesInFolder(directoryPath: string) {
    const files = await fs.promises.readdir(directoryPath);
    const filenames = [];

    for (const file of files) {
        const fullPath = path.join(directoryPath, file);
        const stat = await fs.promises.stat(fullPath);
        if (stat.isFile()) {
            filenames.push(file);
        }
    }

    return filenames;
}

export async function hasFiles(folderPath: string) {
    try {
        const files = await fs.promises.readdir(folderPath);
        return files.length > 0;
    } catch (err) {
        return false;
    }
}
