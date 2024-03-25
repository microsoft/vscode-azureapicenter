// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

export function opticDiff(filePath1: string, filePath2: string) {
    filePath1 = convertDriveLetterToUpperCase(filePath1);
    filePath2 = convertDriveLetterToUpperCase(filePath2);

    const task = new vscode.Task(
        { type: 'shell' },
        vscode.TaskScope.Workspace,
        'Breaking Change Detection',
        'Azure API Center',
        new vscode.ShellExecution(`npx @useoptic/optic diff "${filePath1}" "${filePath2}" --check`),
        "$optic"
    );

    vscode.tasks.executeTask(task);
}

// This function is a workaround for a bug in Optic where it doesn't handle drive letters in a case-insensitive way on Windows
function convertDriveLetterToUpperCase(filePath: string): string {
    if (os.platform() === 'win32' && path.isAbsolute(filePath) && filePath[1] === ':') {
        return filePath[0].toUpperCase() + filePath.slice(1);
    }

    return filePath;
}

