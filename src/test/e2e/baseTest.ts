// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { _electron, test as base, type Page } from '@playwright/test';
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import { AES, algo, enc, PBKDF2 } from 'crypto-js';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { Database } from 'sqlite3';
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
                '--password-store=basic',
                ...args,
                `--extensionDevelopmentPath=${path.join(__dirname, '..', '..', '..', '..')
                }`,
                await createProject(),
            ],
        });
        const workbox = await electronApp.firstWindow();
        await insertToDB(args[1].split('=')[1]);
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

async function insertToDB(path) {
    if (os.platform() != 'linux' || (! await (fs.pathExists('./config.json')))) {
        return;
    }
    console.log('------------- insert into DB --------------')
    const dbpath = `${path}/User/globalStorage/state.vscdb`;
    const config = require('./config.json');
    const db = new Database(dbpath);
    for (let item of config) {
        const key: string = item.key;
        let tobeInsertValue: string = item.value;
        if (key.startsWith('secret://')) {
            const encryptData = getEncryptData('peanuts', tobeInsertValue);
            const jsonString = getJsonFromBytes(encryptData);
            tobeInsertValue = JSON.stringify({ "type": "Buffer", "data": jsonString })
        }

        db.run(`INSERT INTO ItemTable (key, value) VALUES (?, ?)`, [key, tobeInsertValue], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
    };
}

function getEncryptData(password: string, data: string): string {
    const iv = enc.Utf8.parse(' '.repeat(16));
    const key = PBKDF2(password, 'saltysalt', {
        keySize: 4,
        iterations: 1,
        hasher: algo.SHA1
    });
    const encrypted = AES.encrypt(enc.Utf8.parse(data), key, { iv: iv });
    const cipherHex = encrypted.ciphertext.toString(enc.Hex);
    const prefix = 'v10';  // or 'v11' depending on your requirement
    const finalData = enc.Base64.stringify(enc.Hex.parse(cipherHex));
    // const bd = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(prefix))
    const buf = Buffer.from(prefix).toString('base64')
    return buf + finalData;
}

function getJsonFromBytes(base64String: string) {
    // Decode the base64 encoded string to a binary string
    const binaryString = atob(base64String);
    // Create a Uint8Array from the binary string
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
    }
    // Convert the Uint8Array to a regular array
    const byteArrayArray = Array.from(byteArray);
    return byteArrayArray;
}
