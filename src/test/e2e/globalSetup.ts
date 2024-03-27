// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { downloadAndUnzipVSCode } from '@vscode/test-electron';

export default async () => {
    await downloadAndUnzipVSCode('insiders');
    // await downloadAndUnzipVSCode('stable');
};
