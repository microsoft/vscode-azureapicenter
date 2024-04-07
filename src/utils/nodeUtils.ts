// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { exec as execCb } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCb);

export async function checkNodeVersion(): Promise<string | undefined> {
    try {
        const { stdout } = await exec('node --version');
        return stdout;
    } catch (err) {
        return undefined;
    }
}
