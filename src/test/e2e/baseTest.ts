// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { _electron, test as base, type Page } from '@playwright/test';
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import { spawnSync } from "child_process";
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
export { expect } from '@playwright/test';

export type TestOptions = {
    vscodeVersion: string;
};

type TestFixtures = TestOptions & {
    workbox: Page,
    createProject: () => Promise<string>,
    createTempDir: () => Promise<string>,
};


export const test = base.extend<TestFixtures>({
    vscodeVersion: ['insiders', { option: true }],

    workbox: async ({ vscodeVersion, createProject, createTempDir }, use) => {
        const defaultCachePath = await createTempDir();
        const vscodePath = await downloadAndUnzipVSCode(vscodeVersion);
        const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodePath);
        spawnSync(cli, [...args, '--install-extension', 'ms-vscode.azure-account'], {
            encoding: 'utf-8',
            stdio: 'inherit'
        });
        const electronApp = await _electron.launch({
            executablePath: vscodePath,
            env: { ...process.env, NODE_ENV: 'development' },
            args: [
                // Stolen from https://github.com/microsoft/vscode-test/blob/0ec222ef170e102244569064a12898fb203e5bb7/lib/runTest.ts#L126-L160
                // https://github.com/microsoft/vscode/issues/84238
                '--no-sandbox',
                // https://github.com/microsoft/vscode-test/issues/221
                '--disable-gpu-sandbox',
                // https://github.com/microsoft/vscode-test/issues/120
                '--disable-updates',
                '--skip-welcome',
                '--skip-release-notes',
                '--disable-workspace-trust',
                `--extensionDevelopmentPath=${path.join(__dirname, '..', '..', '..', '..')
                }`,
                ...args,
                await createProject(),
            ],
        });
        const workbox = await electronApp.firstWindow();
        await workbox.context().tracing.start({ screenshots: true, snapshots: true, title: test.info().title });
        await use(workbox);
        const tracePath = test.info().outputPath('trace.zip');
        await workbox.context().tracing.stop({ path: tracePath });
        test.info().attachments.push({ name: 'trace', path: tracePath, contentType: 'application/zip' });
        await electronApp.close();
        const logPath = path.join(defaultCachePath, 'user-data');
        if (await fs.exists(logPath)) {
            const logOutputPath = test.info().outputPath('vscode-logs');
            await fs.copy(logPath, logOutputPath);
        }
    },
    createProject: async ({ createTempDir }, use) => {
        await use(async () => {
            // We want to be outside of the project directory to avoid already installed dependencies.
            const projectPath = await createTempDir();
            if (await fs.exists(projectPath)) {
                await fs.rm(projectPath, { recursive: true });
            }
            console.log(`Creating project in ${projectPath}`);
            await fs.mkdir(projectPath);
            return projectPath;
        });
    },
    createTempDir: async ({ }, use) => {
        const tempDirs: string[] = [];
        await use(async () => {
            const tempDir = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'apic-')));
            tempDirs.push(tempDir);
            return tempDir;
        });
        for (const tempDir of tempDirs) {
            await fs.rm(tempDir, { recursive: true });
        }
    }
});
