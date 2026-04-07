// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { _fs, installSkill } from '../../../commands/installSkill';

describe('installSkill', () => {
    let sandbox: sinon.SinonSandbox;
    let withProgressStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;
    let showInformationMessageStub: sinon.SinonStub;
    let createDirectoryStub: sinon.SinonStub;
    let writeFileStub: sinon.SinonStub;
    let fetchStub: sinon.SinonStub;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        showErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage').resolves();
        showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves();
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

    it('shows error when sourceUrl is missing', async () => {
        await installSkill('', 'my-skill');
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(withProgressStub);
    });

    it('shows error when name is missing', async () => {
        await installSkill('https://github.com/owner/repo/tree/main/skills/mine', '');
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(withProgressStub);
    });

    it('shows error when no workspace folder is open', async () => {
        sandbox.stub(vscode.workspace, 'workspaceFolders').value(undefined);
        await installSkill('https://github.com/owner/repo/tree/main/skills/mine', 'my-skill');
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(withProgressStub);
    });

    it('downloads files and shows success message on happy path', async () => {
        const fakeWorkspaceUri = vscode.Uri.file('/fake/workspace');
        sandbox.stub(vscode.workspace, 'workspaceFolders').value([
            { uri: fakeWorkspaceUri, name: 'workspace', index: 0 }
        ]);

        const fakeContents = [
            { type: 'file', name: 'skill.md', path: 'skills/mine/skill.md', download_url: 'https://raw.githubusercontent.com/owner/repo/main/skills/mine/skill.md' },
            { type: 'file', name: 'config.json', path: 'skills/mine/config.json', download_url: 'https://raw.githubusercontent.com/owner/repo/main/skills/mine/config.json' },
        ];

        fetchStub
            .onFirstCall().resolves({ ok: true, json: async () => fakeContents } as any)
            .onSecondCall().resolves({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) } as any)
            .onThirdCall().resolves({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) } as any);

        await installSkill('https://github.com/owner/repo/tree/main/skills/mine', 'my-skill');

        sandbox.assert.calledOnce(withProgressStub);
        assert.equal(fetchStub.callCount, 3);
        assert.equal(createDirectoryStub.callCount, 1); // targetDir created once before the loop
        assert.equal(writeFileStub.callCount, 2);
        sandbox.assert.calledOnce(showInformationMessageStub);
    });

    it('shows error message when GitHub API request fails', async () => {
        const fakeWorkspaceUri = vscode.Uri.file('/fake/workspace');
        sandbox.stub(vscode.workspace, 'workspaceFolders').value([
            { uri: fakeWorkspaceUri, name: 'workspace', index: 0 }
        ]);

        fetchStub.resolves({ ok: false, status: 404, statusText: 'Not Found' } as any);

        await installSkill('https://github.com/owner/repo/tree/main/skills/mine', 'my-skill');

        sandbox.assert.calledOnce(withProgressStub);
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(showInformationMessageStub);
    });

    it('shows error message when sourceUrl is not a GitHub tree URL', async () => {
        const fakeWorkspaceUri = vscode.Uri.file('/fake/workspace');
        sandbox.stub(vscode.workspace, 'workspaceFolders').value([
            { uri: fakeWorkspaceUri, name: 'workspace', index: 0 }
        ]);

        await installSkill('https://example.com/not-github', 'my-skill');

        sandbox.assert.calledOnce(withProgressStub); // withProgress is called; URL parsing fails inside
        sandbox.assert.calledOnce(showErrorMessageStub);
        sandbox.assert.notCalled(showInformationMessageStub);
    });
});
