// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';

export default async () => {
    const vscodePath = await downloadAndUnzipVSCode('insiders');
    resolveCliArgsFromVSCodeExecutablePath(vscodePath);
};
