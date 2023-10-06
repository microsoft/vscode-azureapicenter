import * as vscode from 'vscode';

export class ApiCenterTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    getTreeItem(element: TreeItem): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(element.label, element.children ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        treeItem.contextValue = element.type;

        return treeItem;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        if (element) {
            return Promise.resolve(element.children || []);
        } else {
            return Promise.resolve([
                { label: 'Demo Conference API', type: 'parent', children: [
                    { label: 'GET /sessions', type: 'child' },
                    { label: 'GET /session/{id}', type: 'child' },
					{ label: 'GET /session/{id}/topics', type: 'child' },
                    { label: 'POST /session/{id}/feedback', type: 'child' },
					{ label: 'GET /speakers', type: 'child' },
                    { label: 'GET /speaker/{id}', type: 'child' },
					{ label: 'GET /session/{id}/topics', type: 'child' },
                    { label: 'GET /topics', type: 'child' },
					{ label: 'GET /topic/{id}', type: 'child' },
                    { label: 'GET /topic/{id}/speakers', type: 'child' },
					{ label: 'GET /topic/{id}/sessions', type: 'child' }
                ]},
                { label: 'Repairs API', type: 'parent', children: [
                    { label: 'GET /repairs', type: 'child' },
                    { label: 'POST /repairs', type: 'child' },
					{ label: 'PATCH /repairs', type: 'child' },
                    { label: 'DELETE /repairs', type: 'child' }
                ]}
            ]);
        }
    }
}

export interface TreeItem {
    label: string;
	type?: string;
    children?: TreeItem[];
	contextValue?: string;
}