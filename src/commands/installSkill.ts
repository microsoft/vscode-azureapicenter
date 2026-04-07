// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as path from 'path';
import * as vscode from 'vscode';
import { UiStrings } from '../uiStrings';

// Matches: https://github.com/{owner}/{repo}/tree/{branch}/{folderPath}
const GITHUB_TREE_PATTERN = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/;

interface GitHubFolderInfo {
    owner: string;
    repo: string;
    ref: string;
    folderPath: string;
}

interface GitHubContentEntry {
    name: string;
    path: string;
    type: 'file' | 'dir';
    download_url: string;
}

export async function installSkill(sourceUrl: string, name: string | undefined): Promise<void> {
    if (!sourceUrl) {
        vscode.window.showErrorMessage(UiStrings.SkillInstallMissingParams);
        return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage(UiStrings.NoFolderOpened);
        return;
    }

    let folderInfo: GitHubFolderInfo;
    try {
        folderInfo = parseGitHubFolderUrl(sourceUrl);
    } catch (err: unknown) {
        vscode.window.showErrorMessage(UiStrings.SkillInstallInvalidUrl);
        return;
    }

    const skillName = name || folderInfo.folderPath.split('/').pop() || 'skill';

    const confirm = await vscode.window.showInformationMessage(
        vscode.l10n.t('Install skill "{0}" from API Center?', skillName),
        { modal: true, detail: vscode.l10n.t('Source: {0}', sourceUrl) },
        vscode.l10n.t('Install')
    );

    if (confirm !== vscode.l10n.t('Install')) {
        return;
    }

    const rootUri = workspaceFolders[0].uri;
    const skillsRelPath = '.github/skills';
    const targetDir = vscode.Uri.joinPath(rootUri, skillsRelPath, skillName);

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: vscode.l10n.t(UiStrings.SkillInstallProgressTitle, skillName),
            cancellable: false,
        },
        async (progress) => {
            try {
                progress.report({ message: vscode.l10n.t('Fetching file list from GitHub...') });
                const files = await listFilesRecursive(folderInfo.owner, folderInfo.repo, folderInfo.ref, folderInfo.folderPath);

                progress.report({ message: vscode.l10n.t('Downloading {0} file(s)...', files.length) });
                for (const file of files) {
                    const relativePath = file.path.startsWith(folderInfo.folderPath + '/')
                        ? file.path.slice(folderInfo.folderPath.length + 1)
                        : file.path;

                    const fileUri = vscode.Uri.joinPath(targetDir, relativePath);
                    const content = await downloadFile(file.download_url);

                    await vscode.workspace.fs.createDirectory(
                        vscode.Uri.joinPath(targetDir, path.dirname(relativePath))
                    );
                    await vscode.workspace.fs.writeFile(fileUri, content);
                }

                vscode.window.showInformationMessage(
                    vscode.l10n.t(UiStrings.SkillInstallSuccess, skillName)
                );
            } catch (err: unknown) {
                vscode.window.showErrorMessage(
                    vscode.l10n.t(UiStrings.SkillInstallFailed, skillName, (err as Error).message)
                );
            }
        }
    );
}

function parseGitHubFolderUrl(url: string): GitHubFolderInfo {
    const match = GITHUB_TREE_PATTERN.exec(url);
    if (!match) {
        throw new Error(UiStrings.SkillInstallInvalidUrl);
    }
    const [, owner, repo, ref, folderPath] = match;
    return { owner, repo, ref, folderPath };
}

async function listFilesRecursive(
    owner: string,
    repo: string,
    ref: string,
    folderPath: string
): Promise<GitHubContentEntry[]> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}?ref=${ref}`;
    const response = await fetch(apiUrl, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'vscode-azureapicenter',
        },
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText} for ${apiUrl}`);
    }

    const entries = await response.json() as GitHubContentEntry[];
    const results: GitHubContentEntry[] = [];

    for (const entry of entries) {
        if (entry.type === 'file') {
            results.push(entry);
        } else if (entry.type === 'dir') {
            const nested = await listFilesRecursive(owner, repo, ref, entry.path);
            results.push(...nested);
        }
    }

    return results;
}

async function downloadFile(downloadUrl: string): Promise<Uint8Array> {
    const response = await fetch(downloadUrl, {
        headers: { 'User-Agent': 'vscode-azureapicenter' },
    });

    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }

    return new Uint8Array(await response.arrayBuffer());
}

