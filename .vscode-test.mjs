import { defineConfig } from '@vscode/test-cli';
import * as semver from "semver";

import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync("./package.json"));
const vscodeVer = semver.minVersion(pkg.engines.vscode).version;

export default defineConfig({
    label: 'unitTests',
    files: 'out/src/test/**/*.test.js',
    workspaceFolder: 'out/src/test',
    version: vscodeVer,
    mocha: {
        ui: 'tdd',
        timeout: 20000
    },
    launchArgs: [
        "--disable-extension",
        "vscode.git",
        "--disable-extension",
        "vscode.git-ui",
        "--disable-extension",
        "vscode.github",
        "--disable-extension",
        "vscode.github-authentication",
        "--disable-workspace-trust",
    ]
});
