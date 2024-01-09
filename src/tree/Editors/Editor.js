"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editor = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const fse = require("fs-extra");
const path = require("path");
const vscode = require("vscode");
const extensionVariables_1 = require("../../extensionVariables");
const localize_1 = require("../../localize");
const fsUtil_1 = require("../../utils/fsUtil");
const inferDefinitionFileType_1 = require("../../utils/inferDefinitionFileType");
const vscodeUtils_1 = require("../../utils/vscodeUtils");
// tslint:disable-next-line:no-unsafe-any
class Editor {
    constructor(showSavePromptKey) {
        this.showSavePromptKey = showSavePromptKey;
        this.fileMap = {};
        this.ignoreSave = false;
    }
    async showEditor(context, sizeLimit /* in Megabytes */) {
        const data = await this.getData(context);
        const fileType = (0, inferDefinitionFileType_1.inferDefinitionFileType)(data);
        const fileName = await this.getFilename(context, { fileType: fileType });
        const originFileName = await this.getDiffFilename(context, { fileType: fileType });
        this.appendLineToOutput((0, localize_1.localize)('opening', 'Opening "{0}"...', fileName));
        if (sizeLimit !== undefined) {
            const size = await this.getSize(context);
            if (size > sizeLimit) {
                const message = (0, localize_1.localize)('tooLargeError', '"{0}" is too large to download.', fileName);
                throw new Error(message);
            }
        }
        const localFilePath = await (0, fsUtil_1.createTemporaryFile)(fileName);
        const localOriginPath = await (0, fsUtil_1.createTemporaryFile)(originFileName);
        const document = await vscode.workspace.openTextDocument(localFilePath);
        if (document.isDirty) {
            const overwriteFlag = await vscode.window.showWarningMessage((0, localize_1.localize)("", `You are about to overwrite "${fileName}", which has unsaved changes. Do you want to continue?`), { modal: true }, vscode_azext_utils_1.DialogResponses.yes, vscode_azext_utils_1.DialogResponses.cancel);
            if (overwriteFlag !== vscode_azext_utils_1.DialogResponses.yes) {
                throw new vscode_azext_utils_1.UserCancelledError();
            }
        }
        this.fileMap[localFilePath] = [document, context];
        // store an original copy of the data
        await fse.writeFile(localOriginPath, data);
        const textEditor = await vscode.window.showTextDocument(document);
        await this.updateEditor(data, textEditor);
        return localFilePath;
    }
    async showReadOnlyEditor(context, sizeLimit /* in Megabytes */) {
        const filePath = await this.createTempFileFromTree(context, sizeLimit);
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
        await vscode.window.showTextDocument(document);
        return filePath;
    }
    async createTempFileFromTree(context, sizeLimit /* in Megabytes */) {
        const data = await this.getData(context);
        const fileType = (0, inferDefinitionFileType_1.inferDefinitionFileType)(data);
        const fileName = await this.getFilename(context, { fileType: fileType });
        this.appendLineToOutput((0, localize_1.localize)('opening', 'Opening "{0}"...', fileName));
        if (sizeLimit !== undefined) {
            const size = await this.getSize(context);
            if (size > sizeLimit) {
                const message = (0, localize_1.localize)('tooLargeError', '"{0}" is too large to download.', fileName);
                throw new Error(message);
            }
        }
        const localFilePath = await (0, fsUtil_1.createTemporaryFile)(fileName);
        // store an original copy of the data
        await fse.writeFile(localFilePath, data);
        return localFilePath;
    }
    async updateMatchingContext(doc) {
        const filePath = Object.keys(this.fileMap).find((fsPath) => path.relative(doc.fsPath, fsPath) === '');
        if (filePath) {
            const [textDocument, context] = this.fileMap[filePath];
            await this.updateRemote(context, textDocument);
        }
    }
    async dispose() {
        Object.keys(this.fileMap).forEach(async (key) => await fse.remove(path.dirname(key)));
    }
    async onDidSaveTextDocument(actionContext, globalState, doc) {
        actionContext.telemetry.suppressIfSuccessful = true;
        const filePath = Object.keys(this.fileMap).find((fsPath) => path.relative(doc.uri.fsPath, fsPath) === '');
        if (!this.ignoreSave && filePath) {
            actionContext.telemetry.suppressIfSuccessful = false;
            const context = this.fileMap[filePath][1];
            const showSaveWarning = vscode.workspace.getConfiguration().get(this.showSavePromptKey);
            if (showSaveWarning) {
                const message = await this.getSaveConfirmationText(context);
                const result = await vscode.window.showWarningMessage(message, vscode_azext_utils_1.DialogResponses.upload, vscode_azext_utils_1.DialogResponses.alwaysUpload, vscode_azext_utils_1.DialogResponses.dontUpload);
                if (result === vscode_azext_utils_1.DialogResponses.alwaysUpload) {
                    await vscode.workspace.getConfiguration().update(this.showSavePromptKey, false, vscode.ConfigurationTarget.Global);
                    await globalState.update(this.showSavePromptKey, true);
                }
                else if (result === vscode_azext_utils_1.DialogResponses.dontUpload) {
                    throw new vscode_azext_utils_1.UserCancelledError();
                }
                else if (!result) {
                    throw new vscode_azext_utils_1.UserCancelledError();
                }
            }
            await this.updateRemote(context, doc);
        }
    }
    appendLineToOutput(value) {
        extensionVariables_1.ext.outputChannel.appendLine(value);
        extensionVariables_1.ext.outputChannel.show(true);
    }
    async updateRemote(context, doc) {
        const rawText = doc.getText();
        const fileType = (0, inferDefinitionFileType_1.inferDefinitionFileType)(rawText);
        const filename = await this.getFilename(context, { fileType: fileType });
        this.appendLineToOutput((0, localize_1.localize)('updating', 'Updating "{0}" ...', filename));
        const updatedData = await this.updateData(context, rawText);
        this.appendLineToOutput((0, localize_1.localize)('done', 'Updated "{0}".', filename));
        await this.updateEditor(updatedData, vscode.window.activeTextEditor);
    }
    async updateEditor(data, textEditor) {
        if (!!textEditor) {
            await (0, vscodeUtils_1.writeToEditor)(textEditor, data);
            this.ignoreSave = true;
            try {
                await textEditor.document.save();
            }
            finally {
                this.ignoreSave = false;
            }
        }
    }
}
exports.Editor = Editor;
//# sourceMappingURL=Editor.js.map