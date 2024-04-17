// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async () => {
    const vscodePath = await downloadAndUnzipVSCode('insiders');
    const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodePath);
    await execAsync(`${cli} ${args[0]} ${args[1]} --install-extension ms-vscode.azure-account`, {
        encoding: 'utf-8',
    })
};
