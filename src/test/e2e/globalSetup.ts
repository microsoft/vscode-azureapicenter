// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import { spawnSync } from 'child_process';

export default async () => {
    const vscodePath = await downloadAndUnzipVSCode('insiders');
    const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodePath);
    spawnSync(cli, [...args, '--install-extension', 'ms-vscode.azure-account'], {
        encoding: 'utf-8',
        stdio: 'inherit',
    });
    // await downloadAndUnzipVSCode('stable');
};
