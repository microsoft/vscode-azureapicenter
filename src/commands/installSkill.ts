// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as path from 'path';
import * as unzipper from 'unzipper';
import * as vscode from 'vscode';
import { generateScopes } from '../azure/azureLogin/dataSessionProvider';
import { UiStrings } from '../uiStrings';

// Matches: https://github.com/{owner}/{repo}/tree/{branch}/{folderPath}
const GITHUB_TREE_PATTERN = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)$/;
// Only API Center data plane endpoints may receive an API Center access token, e.g. contoso.data.eastus.azure-apicenter.ms
const API_CENTER_DATA_HOST_PATTERN = /^[a-z0-9-]+\.data\.[a-z0-9-]+\.azure-apicenter\.ms$/i;
const RESOURCE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const SKILL_DEFINITION_FILES = new Set(['skill.md', 'skill.json']);
const MICROSOFT_AUTH_PROVIDER_ID = 'microsoft';
const MAX_PACKAGE_FILES = 1000;
const MAX_PACKAGE_BYTES = 50 * 1024 * 1024;

export interface ApiCenterSkillSource {
    dataApiHost: string;
    workspace: string;
    version?: string;
    clientId: string;
    tenantId: string;
}

export interface SkillInstallRequest {
    name?: string;
    sourceUrl?: string;
    apiCenter?: ApiCenterSkillSource;
}

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

interface SkillFile {
    relativePath: string;
    content: Uint8Array;
}

// Exported for testing only
export const _fs = {
    createDirectory: (uri: vscode.Uri): Thenable<void> => vscode.workspace.fs.createDirectory(uri),
    writeFile: (uri: vscode.Uri, content: Uint8Array): Thenable<void> => vscode.workspace.fs.writeFile(uri, content),
};

/**
 * Parses the query of a `vscode://apidev.azure-api-center/install` deep link.
 * API Center coordinates are only included when the data host, client ID and tenant ID are all present.
 */
export function parseSkillInstallRequest(query: URLSearchParams): SkillInstallRequest {
    const dataApiHost = query.get('dataApiHost') ?? undefined;
    const clientId = query.get('clientId') ?? undefined;
    const tenantId = query.get('tenantId') ?? undefined;

    return {
        name: query.get('name') ?? undefined,
        sourceUrl: query.get('sourceUrl') || undefined,
        apiCenter: dataApiHost && clientId && tenantId
            ? { dataApiHost, clientId, tenantId, workspace: query.get('workspace') || 'default', version: query.get('version') || undefined }
            : undefined,
    };
}

export async function installSkill(request: SkillInstallRequest): Promise<void> {
    const { name, sourceUrl, apiCenter } = request;
    if (!name || (!sourceUrl && !apiCenter)) {
        vscode.window.showErrorMessage(UiStrings.SkillInstallMissingParams);
        return;
    }

    if (!RESOURCE_NAME_PATTERN.test(name)) {
        vscode.window.showErrorMessage(vscode.l10n.t(UiStrings.SkillInstallInvalidName, name));
        return;
    }

    if (apiCenter && !isValidApiCenterSource(apiCenter)) {
        vscode.window.showErrorMessage(vscode.l10n.t(UiStrings.SkillInstallUntrustedHost, apiCenter.dataApiHost));
        return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage(UiStrings.NoFolderOpened);
        return;
    }

    const skillsRelPath = `.github/skills/${name}`;
    const targetDir = vscode.Uri.joinPath(workspaceFolders[0].uri, skillsRelPath);

    const confirmation = await vscode.window.showWarningMessage(
        vscode.l10n.t(UiStrings.SkillInstallConfirm, name, apiCenter?.dataApiHost ?? sourceUrl!, skillsRelPath),
        { modal: true },
        UiStrings.SkillInstallConfirmButton
    );
    if (confirmation !== UiStrings.SkillInstallConfirmButton) {
        return;
    }

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: vscode.l10n.t(UiStrings.SkillInstallProgressTitle, name),
            cancellable: false,
        },
        async (progress) => {
            try {
                let files: SkillFile[] | undefined;
                if (apiCenter) {
                    progress.report({ message: vscode.l10n.t('Downloading skill from API Center...') });
                    files = await downloadFromApiCenter(apiCenter, name);
                    if (!files && !sourceUrl) {
                        throw new Error(UiStrings.SkillInstallNotFoundInApiCenter);
                    }
                }

                if (!files) {
                    files = await downloadFromGitHub(sourceUrl!, progress);
                }

                await writeSkillFiles(targetDir, files);
                vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.SkillInstallSuccess, name));
            } catch (err: unknown) {
                vscode.window.showErrorMessage(
                    vscode.l10n.t(UiStrings.SkillInstallFailed, name, (err as Error).message)
                );
            }
        }
    );
}

function isValidApiCenterSource(source: ApiCenterSkillSource): boolean {
    return API_CENTER_DATA_HOST_PATTERN.test(source.dataApiHost)
        && RESOURCE_NAME_PATTERN.test(source.workspace)
        && (source.version === undefined || RESOURCE_NAME_PATTERN.test(source.version));
}

/**
 * Downloads the skill package from the API Center data plane. Returns undefined when API Center has no stored files for the skill.
 */
async function downloadFromApiCenter(source: ApiCenterSkillSource, name: string): Promise<SkillFile[] | undefined> {
    const session = await vscode.authentication.getSession(
        MICROSOFT_AUTH_PROVIDER_ID,
        generateScopes(source.clientId, source.tenantId),
        { createIfNone: true }
    );

    const versionSegment = source.version ? `/versions/${encodeURIComponent(source.version)}` : '';
    const url = `https://${source.dataApiHost}/workspaces/${encodeURIComponent(source.workspace)}/skills/${encodeURIComponent(name)}${versionSegment}/download`;
    const response = await fetch(url, {
        method: 'POST',
        redirect: 'error',
        headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'User-Agent': 'vscode-azureapicenter',
        },
    });

    if (response.status === 404) {
        return undefined;
    }

    if (!response.ok) {
        throw new Error(`API Center error: ${response.status} ${response.statusText}`);
    }

    const archive = Buffer.from(await response.arrayBuffer());
    if (archive.length > MAX_PACKAGE_BYTES) {
        throw new Error(UiStrings.SkillInstallPackageTooLarge);
    }

    return extractSkillPackage(archive);
}

async function extractSkillPackage(archive: Buffer): Promise<SkillFile[]> {
    const directory = await unzipper.Open.buffer(archive);
    const entries = directory.files.filter((entry) => entry.type === 'File');

    const totalSize = entries.reduce((sum, entry) => sum + entry.uncompressedSize, 0);
    if (entries.length > MAX_PACKAGE_FILES || totalSize > MAX_PACKAGE_BYTES) {
        throw new Error(UiStrings.SkillInstallPackageTooLarge);
    }

    const files: SkillFile[] = [];
    for (const entry of entries) {
        const relativePath = toSafeRelativePath(entry.path);
        files.push({ relativePath, content: new Uint8Array(await entry.buffer()) });
    }

    if (!files.some((file) => !file.relativePath.includes('/') && SKILL_DEFINITION_FILES.has(file.relativePath.toLowerCase()))) {
        throw new Error(UiStrings.SkillInstallMissingSkillDefinition);
    }

    return files;
}

async function downloadFromGitHub(sourceUrl: string, progress: vscode.Progress<{ message?: string }>): Promise<SkillFile[]> {
    let folderInfo: GitHubFolderInfo;
    try {
        folderInfo = parseGitHubFolderUrl(sourceUrl);
    } catch {
        throw new Error(UiStrings.SkillInstallInvalidUrl);
    }

    progress.report({ message: vscode.l10n.t('Fetching file list from GitHub...') });
    const entries = await listFilesRecursive(folderInfo.owner, folderInfo.repo, folderInfo.ref, folderInfo.folderPath, true);

    progress.report({ message: vscode.l10n.t('Downloading {0} file(s)...', entries.length) });
    const files: SkillFile[] = [];
    for (const entry of entries) {
        const relativePath = entry.path.startsWith(folderInfo.folderPath + '/')
            ? entry.path.slice(folderInfo.folderPath.length + 1)
            : entry.path;
        files.push({ relativePath: toSafeRelativePath(relativePath), content: await downloadFile(entry.download_url) });
    }

    return files;
}

async function writeSkillFiles(targetDir: vscode.Uri, files: SkillFile[]): Promise<void> {
    await _fs.createDirectory(targetDir);
    for (const file of files) {
        const parentRelative = path.posix.dirname(file.relativePath);
        if (parentRelative !== '.') {
            await _fs.createDirectory(vscode.Uri.joinPath(targetDir, parentRelative));
        }
        await _fs.writeFile(vscode.Uri.joinPath(targetDir, file.relativePath), file.content);
    }
}

/** Rejects paths that could escape the skill folder (absolute paths, drive letters, or '..' segments). */
function toSafeRelativePath(entryPath: string): string {
    const normalized = entryPath.replace(/\\/g, '/');
    const segments = normalized.split('/');
    if (normalized.startsWith('/') || normalized.includes(':') || segments.some((s) => s === '' || s === '.' || s === '..')) {
        throw new Error(vscode.l10n.t(UiStrings.SkillInstallUnsafePath, entryPath));
    }
    return normalized;
}

function parseGitHubFolderUrl(url: string): GitHubFolderInfo {
    const match = GITHUB_TREE_PATTERN.exec(url);
    if (!match) {
        throw new Error(UiStrings.SkillInstallInvalidUrl);
    }
    const [, owner, repo, ref, folderPath] = match;
    return { owner, repo, ref, folderPath };
}

function hasRootSkillDefinition(entries: GitHubContentEntry[]): boolean {
    return entries.some(
        (entry) => entry.type === 'file' && SKILL_DEFINITION_FILES.has(entry.name.toLowerCase())
    );
}

async function listFilesRecursive(
    owner: string,
    repo: string,
    ref: string,
    folderPath: string,
    requireSkillRoot = false
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
    if (!Array.isArray(entries) || (requireSkillRoot && !hasRootSkillDefinition(entries))) {
        throw new Error(UiStrings.SkillInstallMissingSkillDefinition);
    }

    const results: GitHubContentEntry[] = [];

    for (const entry of entries) {
        if (entry.type === 'file') {
            results.push(entry);
        } else if (entry.type === 'dir') {
            const nested = await listFilesRecursive(owner, repo, ref, entry.path, false);
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
