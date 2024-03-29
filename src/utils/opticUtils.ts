// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { UiStrings } from '../uiStrings';

export async function opticDiff(filePath1: string, filePath2: string) {
    filePath1 = convertDriveLetterToUpperCase(filePath1);
    filePath2 = convertDriveLetterToUpperCase(filePath2);

    const task = new vscode.Task(
        { type: 'shell' },
        vscode.TaskScope.Workspace,
        UiStrings.OpticTaskName,
        UiStrings.OpticTaskSource,
        new vscode.ShellExecution(`npx -y @useoptic/optic@0.54.12 diff '${filePath1}' '${filePath2}' --check`),
        "$optic"
    );

    await vscode.tasks.executeTask(task);
}

// This function is a workaround for a bug in Optic where it doesn't handle drive letter with lower case on Windows:
// https://github.com/opticdev/optic/issues/2810
function convertDriveLetterToUpperCase(filePath: string): string {
    if (os.platform() === 'win32' && path.isAbsolute(filePath) && filePath[1] === ':') {
        return filePath[0].toUpperCase() + filePath.slice(1);
    }

    return filePath;
}

