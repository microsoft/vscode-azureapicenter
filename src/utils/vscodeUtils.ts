// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';

// tslint:disable-next-line:export-name
export async function writeToEditor(editor: vscode.TextEditor, data: string): Promise<void> {
    await editor.edit((editBuilder: vscode.TextEditorEdit) => {
        if (editor.document.lineCount > 0) {
            const lastLine: vscode.TextLine = editor.document.lineAt(editor.document.lineCount - 1);
            editBuilder.delete(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(lastLine.range.start.line, lastLine.range.end.character)));
        }
        editBuilder.insert(new vscode.Position(0, 0), data);
    });
}
