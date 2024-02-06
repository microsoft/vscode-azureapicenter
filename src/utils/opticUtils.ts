import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

let opticTerminal: vscode.Terminal | undefined;

vscode.window.onDidCloseTerminal(closedTerminal => {
    if (opticTerminal === closedTerminal) {
        opticTerminal = undefined;
    }
});

export function opticDiff(filePath1: string, filePath2: string) {
    filePath1 = convertDriveLetterToUpperCase(filePath1);
    filePath2 = convertDriveLetterToUpperCase(filePath2);

    if (!opticTerminal) {
        opticTerminal = vscode.window.createTerminal({
            name: 'Optic',
            message: 'Breaking Change Detection '
        });
    }

    opticTerminal.sendText(`optic diff "${filePath1}" "${filePath2}" --check`);
    opticTerminal.show();
}

// This function is a workaround for a bug in Optic where it doesn't handle drive letters in a case-insensitive way on Windows
function convertDriveLetterToUpperCase(filePath: string): string {
    if (os.platform() === 'win32' && path.isAbsolute(filePath) && filePath[1] === ':') {
        return filePath[0].toUpperCase() + filePath.slice(1);
    }

    return filePath;
}

