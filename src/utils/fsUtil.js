"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultWorkspacePath = exports.getRandomHexString = exports.getSessionWorkingFolderName = exports.createTemporaryFolder = exports.createTemporaryFile = void 0;
const crypto = require("crypto");
const fse = require("fs-extra");
const path = require("path");
const constants_1 = require("../constants");
const extensionVariables_1 = require("../extensionVariables");
async function createTemporaryFile(fileName) {
    // The extension globalStoragePath is a wellknown for vscode and will cleanup when extension gets uninstalled.
    const defaultWorkspacePath = path.join(extensionVariables_1.ext.context.globalStoragePath, constants_1.extensionName);
    await fse.ensureDir(defaultWorkspacePath);
    // Every vscode sessions will get a unique folder to works with the files
    // This folder will be deleted post vscode session.
    const sessionFolder = getSessionWorkingFolderName();
    const filePath = path.join(defaultWorkspacePath, sessionFolder, fileName);
    await fse.ensureFile(filePath);
    return filePath;
}
exports.createTemporaryFile = createTemporaryFile;
// make a function that creates a temporary folder
async function createTemporaryFolder(folderName) {
    const defaultWorkspacePath = path.join(extensionVariables_1.ext.context.globalStoragePath, constants_1.extensionName);
    await fse.ensureDir(defaultWorkspacePath);
    const sessionFolder = getSessionWorkingFolderName();
    const folderPath = path.join(defaultWorkspacePath, sessionFolder, folderName);
    await fse.ensureDir(folderPath);
    return folderPath;
}
exports.createTemporaryFolder = createTemporaryFolder;
function getSessionWorkingFolderName() {
    let sessionFolderName = extensionVariables_1.ext.context.globalState.get(constants_1.sessionFolderKey);
    // tslint:disable-next-line: strict-boolean-expressions
    if (!sessionFolderName) {
        sessionFolderName = getRandomHexString();
        extensionVariables_1.ext.outputChannel.appendLine(`Session working folder:${sessionFolderName}`);
        extensionVariables_1.ext.context.globalState.update(constants_1.sessionFolderKey, sessionFolderName);
    }
    return sessionFolderName;
}
exports.getSessionWorkingFolderName = getSessionWorkingFolderName;
function getRandomHexString(length = 10) {
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    return buffer.toString('hex').slice(0, length);
}
exports.getRandomHexString = getRandomHexString;
function getDefaultWorkspacePath() {
    return path.join(extensionVariables_1.ext.context.globalStoragePath, constants_1.extensionName);
}
exports.getDefaultWorkspacePath = getDefaultWorkspacePath;
//# sourceMappingURL=fsUtil.js.map