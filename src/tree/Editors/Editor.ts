// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { DialogResponses, IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { ext } from '../../extensionVariables';
import { UiStrings } from "../../uiStrings";
import { createTemporaryFile } from '../../utils/fsUtil';
import { DefinitionFileType, inferDefinitionFileType } from "../../utils/inferDefinitionFileType";
import { writeToEditor } from '../../utils/vscodeUtils';

export interface EditorOptions {
    readonly fileType: DefinitionFileType
}

// tslint:disable-next-line:no-unsafe-any
export abstract class Editor<ContextT> implements vscode.Disposable {
    private fileMap: { [key: string]: [vscode.TextDocument, ContextT] } = {};
    private ignoreSave: boolean = false;

    constructor(private readonly showSavePromptKey: string) {
    }

    public abstract getData(context: ContextT): Promise<string>;
    public abstract updateData(context: ContextT, data: string): Promise<string>;
    public abstract getFilename(context: ContextT, options: EditorOptions): Promise<string>;
    public abstract getDiffFilename(context: ContextT, options: EditorOptions): Promise<string>;
    public abstract getSaveConfirmationText(context: ContextT): Promise<string>;
    public abstract getSize(context: ContextT): Promise<number>;
    public async showEditor(context: ContextT, sizeLimit?: number /* in Megabytes */): Promise<string> {
        const data: string = await this.getData(context);

        const fileType: DefinitionFileType = inferDefinitionFileType(data);
        const fileName: string = await this.getFilename(context, { fileType: fileType });
        const originFileName: string = await this.getDiffFilename(context, { fileType: fileType });

        this.appendLineToOutput(vscode.l10n.t(UiStrings.Opening, fileName));
        if (sizeLimit !== undefined) {
            const size: number = await this.getSize(context);
            if (size > sizeLimit) {
                const message: string = vscode.l10n.t(UiStrings.TooLargeError, fileName);
                throw new Error(message);
            }
        }

        const localFilePath: string = await createTemporaryFile(fileName);
        const localOriginPath: string = await createTemporaryFile(originFileName);
        const document: vscode.TextDocument = await vscode.workspace.openTextDocument(localFilePath);
        if (document.isDirty) {
            const overwriteFlag = await vscode.window.showWarningMessage(vscode.l10n.t(UiStrings.OverwriteWarning, fileName), { modal: true }, DialogResponses.yes, DialogResponses.cancel);
            if (overwriteFlag !== DialogResponses.yes) {
                throw new UserCancelledError();
            }
        }

        this.fileMap[localFilePath] = [document, context];

        // store an original copy of the data
        await fse.writeFile(localOriginPath, data);

        const textEditor: vscode.TextEditor = await vscode.window.showTextDocument(document);
        await this.updateEditor(data, textEditor);

        return localFilePath;
    }

    public async createTempFileFromTree(context: ContextT, sizeLimit?: number /* in Megabytes */) {
        const data: string = await this.getData(context);

        const fileType: DefinitionFileType = inferDefinitionFileType(data);
        const fileName: string = await this.getFilename(context, { fileType: fileType });
        const originFileName: string = await this.getDiffFilename(context, { fileType: fileType });

        this.appendLineToOutput(vscode.l10n.t(UiStrings.Opening, fileName));
        if (sizeLimit !== undefined) {
            const size: number = await this.getSize(context);
            if (size > sizeLimit) {
                const message: string = vscode.l10n.t(UiStrings.TooLargeError, fileName);
                throw new Error(message);
            }
        }

        const localFilePath: string = await createTemporaryFile(fileName);

        // store an original copy of the data
        await fse.writeFile(localFilePath, data);
        return localFilePath;
    }

    public async updateMatchingContext(doc: vscode.Uri): Promise<void> {
        const filePath: string | undefined = Object.keys(this.fileMap).find((fsPath: string) => path.relative(doc.fsPath, fsPath) === '');
        if (filePath) {
            const [textDocument, context]: [vscode.TextDocument, ContextT] = this.fileMap[filePath];
            await this.updateRemote(context, textDocument);
        }
    }

    public async dispose(): Promise<void> {
        Object.keys(this.fileMap).forEach(async (key: string) => await fse.remove(path.dirname(key)));
    }

    public async onDidSaveTextDocument(actionContext: IActionContext, globalState: vscode.Memento, doc: vscode.TextDocument): Promise<void> {
        actionContext.telemetry.suppressIfSuccessful = true;
        const filePath: string | undefined = Object.keys(this.fileMap).find((fsPath: string) => path.relative(doc.uri.fsPath, fsPath) === '');
        if (!this.ignoreSave && filePath) {
            actionContext.telemetry.suppressIfSuccessful = false;
            const context: ContextT = this.fileMap[filePath][1];
            const showSaveWarning: boolean | undefined = vscode.workspace.getConfiguration().get(this.showSavePromptKey);

            if (showSaveWarning) {
                const message: string = await this.getSaveConfirmationText(context);
                const result: vscode.MessageItem | undefined = await vscode.window.showWarningMessage(message, DialogResponses.upload, DialogResponses.alwaysUpload, DialogResponses.dontUpload);
                if (result === DialogResponses.alwaysUpload) {
                    await vscode.workspace.getConfiguration().update(this.showSavePromptKey, false, vscode.ConfigurationTarget.Global);
                    await globalState.update(this.showSavePromptKey, true);
                } else if (result === DialogResponses.dontUpload) {
                    throw new UserCancelledError();
                } else if (!result) {
                    throw new UserCancelledError();
                }
            }
            await this.updateRemote(context, doc);
        }
    }

    protected appendLineToOutput(value: string): void {
        ext.outputChannel.appendLine(value);
        ext.outputChannel.show(true);
    }

    private async updateRemote(context: ContextT, doc: vscode.TextDocument): Promise<void> {
        const rawText = doc.getText();

        const fileType = inferDefinitionFileType(rawText);
        const filename: string = await this.getFilename(context, { fileType: fileType });
        this.appendLineToOutput(vscode.l10n.t(UiStrings.Updating, filename));
        const updatedData: string = await this.updateData(context, rawText);
        this.appendLineToOutput(vscode.l10n.t(UiStrings.Updated, filename));
    }

    private async updateEditor(data: string, textEditor?: vscode.TextEditor): Promise<void> {
        if (!!textEditor) {
            await writeToEditor(textEditor, data);
            this.ignoreSave = true;
            try {
                await textEditor.document.save();
            } finally {
                this.ignoreSave = false;
            }
        }
    }
}
