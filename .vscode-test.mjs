import { defineConfig } from '@vscode/test-cli';
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    tests: [{
        label: 'unitTests',
        files: "./__tests__/__integration__/out/test/unit/**/*.test.js",
        srcDir: "./__tests__/__integration__/out/src",
        workspaceFolder: '${__dirname}/__tests__/__integration__/resources',
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
        exclude: [
            `${__dirname}/out`,
            `${__dirname}/__tests__/__integration__/out/__tests__`,
        ],
        reporter: ["text-summary", "html", "json-summary", "lcov"],
        lines: 30
    }
});
