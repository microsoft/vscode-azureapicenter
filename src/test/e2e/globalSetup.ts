// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import { execSync } from 'child_process';

export default async () => {
    const vscodePath = await downloadAndUnzipVSCode('insiders');
    const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodePath);
    execSync(`${cli} ${args.join(' ')} --install-extension humao.rest-client`, {
        encoding: 'utf-8',
    });

};
