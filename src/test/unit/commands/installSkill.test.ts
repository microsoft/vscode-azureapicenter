// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as archiver from 'archiver';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { PassThrough } from 'stream';
import * as vscode from 'vscode';
import { _fs, installSkill, parseSkillInstallRequest, SkillInstallRequest } from '../../../commands/installSkill';
import { UiStrings } from '../../../uiStrings';

const githubSourceUrl = 'https://github.com/owner/repo/tree/main/skills/mine';
const apiCenter = {
    dataApiHost: 'contoso.data.eastus.azure-apicenter.ms',
    workspace: 'default',
    clientId: '00000000-0000-0000-0000-000000000001',
    tenantId: '00000000-0000-0000-0000-000000000002',
};

async function createZip(files: Record<string, string>): Promise<Buffer> {
    const archive = archiver('zip');
    const stream = new PassThrough();
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve, reject) => {
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);
    });
    archive.pipe(stream);
    for (const [name, content] of Object.entries(files)) {
        archive.append(content, { name });
    }
    await archive.finalize();
    return done;
}

function zipResponse(zip: Buffer) {
    return { ok: true, status: 200, arrayBuffer: async () => zip.buffer.slice(zip.byteOffset, zip.byteOffset + zip.byteLength) } as any;
}

describe('installSkill', () => {
    let sandbox: sinon.SinonSandbox;
    let withProgressStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;
    let showInformationMessageStub: sinon.SinonStub;
    let showWarningMessageStub: sinon.SinonStub;
    let getSessionStub: sinon.SinonStub;
    let createDirectoryStub: sinon.SinonStub;
    let writeFileStub: sinon.SinonStub;
    let fetchStub: sinon.SinonStub;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage').resolves();
        showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves();
        showWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage').resolves(UiStrings.SkillInstallConfirmButton as any);
        getSessionStub = sandbox.stub(vscode.authentication, 'getSession').resolves({ accessToken: 'token' } as any);
        createDirectoryStub = sandbox.stub(_fs, 'createDirectory').resolves();
        writeFileStub = sandbox.stub(_fs, 'writeFile').resolves();

        // Simulate withProgress executing the task immediately
        withProgressStub = sandbox.stub(vscode.window, 'withProgress').callsFake(
            async (_options: any, task: (progress: any, token: any) => Thenable<any>) => task({ report: () => { } }, {} as any)
        );

        // Stub global fetch
        fetchStub = sandbox.stub(globalThis, 'fetch' as any);
    });

    afterEach(() => {
        sandbox.restore();
    });

    function openWorkspace() {
        sandbox.stub(vscode.workspace, 'workspaceFolders').value([
            { uri: vscode.Uri.file('/fake/workspace'), name: 'workspace', index: 0 }
        ]);
    }

    function writtenPaths(): string[] {
        return writeFileStub.getCalls().map((call) => (call.args[0] as vscode.Uri).path.split('/.github/skills/')[1]).sort();
    }

    it('parses API Center coordinates only when host, client ID and tenant ID are all present', () => {
        const full = parseSkillInstallRequest(new URLSearchParams({ name: 'my-skill', dataApiHost: apiCenter.dataApiHost, clientId: 'c', tenantId: 't', version: 'v1' }));
        assert.deepStrictEqual(full.apiCenter, { dataApiHost: apiCenter.dataApiHost, clientId: 'c', tenantId: 't', workspace: 'default', version: 'v1' });

        const partial = parseSkillInstallRequest(new URLSearchParams({ name: 'my-skill', sourceUrl: githubSourceUrl, dataApiHost: apiCenter.dataApiHost }));
        assert.strictEqual(partial.apiCenter, undefined);
        assert.strictEqual(partial.sourceUrl, githubSourceUrl);
    });

    it('shows error when no source is provided', async () => {
        await installSkill({ name: 'my-skill' });
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(withProgressStub);
    });

    it('shows error when name is missing', async () => {
        await installSkill({ sourceUrl: githubSourceUrl, name: '' });
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(withProgressStub);
    });

    it('rejects names that would escape the skills folder', async () => {
        openWorkspace();
        await installSkill({ sourceUrl: githubSourceUrl, name: '../outside' });
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(showWarningMessageStub);
        sandbox.assert.notCalled(withProgressStub);
    });

    it('rejects API Center hosts that are not API Center data endpoints without requesting a token', async () => {
        openWorkspace();
        await installSkill({ name: 'my-skill', apiCenter: { ...apiCenter, dataApiHost: 'attacker.example.com' } });
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(getSessionStub);
        sandbox.assert.notCalled(fetchStub);
    });

    it('shows error when no workspace folder is open', async () => {
        sandbox.stub(vscode.workspace, 'workspaceFolders').value(undefined);
        await installSkill({ sourceUrl: githubSourceUrl, name: 'my-skill' });
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(withProgressStub);
    });

    it('does nothing when the user declines the confirmation', async () => {
        openWorkspace();
        showWarningMessageStub.resolves(undefined);
        await installSkill({ sourceUrl: githubSourceUrl, name: 'my-skill' });
        sandbox.assert.notCalled(withProgressStub);
        sandbox.assert.notCalled(fetchStub);
    });

    it('installs the skill package from API Center using an API Center token', async () => {
        openWorkspace();
        fetchStub.resolves(zipResponse(await createZip({ 'SKILL.md': '# skill', 'scripts/run.py': 'print(1)' })));

        await installSkill({ name: 'my-skill', sourceUrl: githubSourceUrl, apiCenter: { ...apiCenter, version: 'v1' } });

        sandbox.assert.calledOnce(fetchStub);
        const [url, init] = fetchStub.getCall(0).args;
        assert.strictEqual(url, 'https://contoso.data.eastus.azure-apicenter.ms/workspaces/default/skills/my-skill/versions/v1/download');
        assert.strictEqual(init.method, 'POST');
        assert.strictEqual(init.headers.Authorization, 'Bearer token');
        assert.ok((getSessionStub.getCall(0).args[1] as string[]).includes(`VSCODE_CLIENT_ID:${apiCenter.clientId}`));
        assert.deepStrictEqual(writtenPaths(), ['my-skill/SKILL.md', 'my-skill/scripts/run.py']);
        sandbox.assert.calledOnce(showInformationMessageStub);
        sandbox.assert.notCalled(showErrorMessageStub);
    });

    it('rejects an API Center package without a root skill definition', async () => {
        openWorkspace();
        fetchStub.resolves(zipResponse(await createZip({ 'nested/SKILL.md': '# skill' })));

        await installSkill({ name: 'my-skill', apiCenter });

        sandbox.assert.notCalled(writeFileStub);
        sandbox.assert.calledOnce(showErrorMessageStub);
    });

    it('falls back to the GitHub source when API Center has no stored files', async () => {
        openWorkspace();
        fetchStub
            .onFirstCall().resolves({ ok: false, status: 404, statusText: 'Not Found' } as any)
            .onSecondCall().resolves({ ok: true, json: async () => [{ type: 'file', name: 'SKILL.md', path: 'skills/mine/SKILL.md', download_url: 'https://raw.githubusercontent.com/x' }] } as any)
            .onThirdCall().resolves({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) } as any);

        const request: SkillInstallRequest = { name: 'my-skill', sourceUrl: githubSourceUrl, apiCenter };
        await installSkill(request);

        assert.strictEqual(fetchStub.callCount, 3);
        assert.ok((fetchStub.getCall(1).args[0] as string).startsWith('https://api.github.com/repos/owner/repo/contents/skills/mine'));
        assert.deepStrictEqual(writtenPaths(), ['my-skill/SKILL.md']);
        sandbox.assert.calledOnce(showInformationMessageStub);
    });

    it('shows error when API Center has no stored files and there is no GitHub source', async () => {
        openWorkspace();
        fetchStub.resolves({ ok: false, status: 404, statusText: 'Not Found' } as any);

        await installSkill({ name: 'my-skill', apiCenter });

        sandbox.assert.calledOnce(fetchStub);
        sandbox.assert.notCalled(writeFileStub);
        sandbox.assert.calledOnce(showErrorMessageStub);
    });

    it('downloads files from GitHub and shows success message on happy path', async () => {
        openWorkspace();

        const fakeContents = [
            { type: 'file', name: 'skill.md', path: 'skills/mine/skill.md', download_url: 'https://raw.githubusercontent.com/owner/repo/main/skills/mine/skill.md' },
            { type: 'file', name: 'config.json', path: 'skills/mine/config.json', download_url: 'https://raw.githubusercontent.com/owner/repo/main/skills/mine/config.json' },
        ];

        fetchStub
            .onFirstCall().resolves({ ok: true, json: async () => fakeContents } as any)
            .onSecondCall().resolves({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) } as any)
            .onThirdCall().resolves({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) } as any);

        await installSkill({ sourceUrl: githubSourceUrl, name: 'my-skill' });

        sandbox.assert.calledOnce(withProgressStub);
        sandbox.assert.notCalled(getSessionStub);
        assert.equal(fetchStub.callCount, 3);
        assert.equal(createDirectoryStub.callCount, 1); // targetDir created once before the loop
        assert.equal(writeFileStub.callCount, 2);
        sandbox.assert.calledOnce(showInformationMessageStub);
    });

    it('rejects GitHub entries whose paths escape the skill folder', async () => {
        openWorkspace();
        fetchStub.resolves({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) } as any);
        fetchStub.onFirstCall().resolves({ ok: true, json: async () => [
            { type: 'file', name: 'SKILL.md', path: 'skills/mine/SKILL.md', download_url: 'https://raw.githubusercontent.com/a' },
            { type: 'file', name: 'x', path: '../x', download_url: 'https://raw.githubusercontent.com/b' },
        ] } as any);

        await installSkill({ sourceUrl: githubSourceUrl, name: 'my-skill' });

        sandbox.assert.notCalled(writeFileStub);
        sandbox.assert.calledOnce(showErrorMessageStub);
    });

    it('shows error message when GitHub API request fails', async () => {
        openWorkspace();
        fetchStub.resolves({ ok: false, status: 404, statusText: 'Not Found' } as any);

        await installSkill({ sourceUrl: githubSourceUrl, name: 'my-skill' });

        sandbox.assert.calledOnce(withProgressStub);
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(showInformationMessageStub);
    });

    it('shows error message when sourceUrl is not a GitHub tree URL', async () => {
        openWorkspace();

        await installSkill({ sourceUrl: 'https://example.com/not-github', name: 'my-skill' });

        sandbox.assert.calledOnce(withProgressStub); // withProgress is called; URL parsing fails inside
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(showInformationMessageStub);
    });

    it('rejects shared parent directories that do not contain a root skill definition without recursing', async () => {
        openWorkspace();

        const parentDirectoryContents = [
            { type: 'dir', name: 'skill-a', path: 'skills/skill-a', download_url: '' },
            { type: 'dir', name: 'skill-b', path: 'skills/skill-b', download_url: '' },
        ];

        fetchStub.onFirstCall().resolves({ ok: true, json: async () => parentDirectoryContents } as any);

        await installSkill({ sourceUrl: 'https://github.com/owner/repo/tree/main/skills', name: 'my-skill' });

        sandbox.assert.calledOnce(withProgressStub);
        assert.equal(fetchStub.callCount, 1);
        sandbox.assert.notCalled(createDirectoryStub);
        sandbox.assert.notCalled(writeFileStub);
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(showInformationMessageStub);
    });
});
