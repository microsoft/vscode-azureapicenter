// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import * as semver from "semver";
const config = require('../../../package.json');
const vscodeVer = config.engines.vscode;
const vscodeVersion = semver.minVersion(vscodeVer)!.version;
export default async () => {
    const vscodePath = await downloadAndUnzipVSCode(vscodeVersion!);
    resolveCliArgsFromVSCodeExecutablePath(vscodePath);
};
