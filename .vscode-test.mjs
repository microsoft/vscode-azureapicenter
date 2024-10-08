import { defineConfig } from '@vscode/test-cli';
import * as semver from "semver";

import { readFileSync } from "fs";
const pkg = JSON.parse(readFileSync("./package.json"));
const vscodeVer = semver.minVersion(pkg.engines.vscode).version;

export default defineConfig({
    tests: [{
        label: 'unitTests',
        files: 'out/test/unit/commands/registerApiSubCommands/registerViaCICD.test.js',
        workspaceFolder: 'out/test',
        version: 'insiders',
        mocha: {
            timeout: 20000,
            ui: 'bdd',
            inlineDiffs: true,
            color: true
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
    }],
    coverage: {
        includeAll: true,
        exclude: ['node_modules/**', 'src/test/**'],
        reporter: ["text-summary", "html", "json-summary", "lcov"],
        lines: 30
    }
});
