import * as vscode from 'vscode';

export function createProjectPreviewUri(projectName: string): vscode.Uri {
    return vscode.Uri.file(`/${projectName}`).with({ scheme: fileSystemScheme, authority: '' });
}

export const fileSystemScheme = 'teams-project-preview';
export class ProjectPreviewFileSystemProvider implements vscode.FileSystemProvider {

    treeData: vscode.FileTreeData | undefined;

    stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
        const node = this._getChild(uri);
        return {
            type: node.children ? vscode.FileType.Directory : vscode.FileType.File,
            ctime: 0,
            mtime: 0,
            size: 0,
            permissions: vscode.FilePermission.Readonly
        };
    }
    readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
        const node = this._getChild(uri);
        return node.children?.map((c) => ([c.label, c.children ? vscode.FileType.Directory : vscode.FileType.File])) ?? [];
    }
    readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array> {
        // In this sample all files in the preview are empty
        // Fill in the actual file contents based on the file and path
        return new TextEncoder().encode('');
    }
    private _getChild(uri: vscode.Uri) {
        let currentNode: vscode.FileTreeData | undefined = this.treeData;
        const relativePath = uri.path.split('/').slice(1);
        for (const segment of relativePath) {
            currentNode = currentNode?.children?.find((child) => child.label === segment);
        }
        if (!currentNode) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        return currentNode;
    }
    
    // Not implemented for readonly filesystem provider
    onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = new vscode.EventEmitter<vscode.FileChangeEvent[]>().event;
    createDirectory(uri: vscode.Uri): void | Thenable<void> {
        throw new Error('Function not implemented.');
    }
    watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
        throw new Error('Function not implemented.');
    }
    writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | Thenable<void> {
        throw new Error('Function not implemented.');
    }
    delete(uri: vscode.Uri, options: { recursive: boolean; }): void | Thenable<void> {
        throw new Error('Function not implemented.');
    }
    rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {
        throw new Error('Function not implemented.');
    }
}