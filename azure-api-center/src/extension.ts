import { download } from '@vscode/test-electron';
import * as vscode from 'vscode';
import axios from 'axios';

interface TreeItem {
    label: string;
	type?: string;
    children?: TreeItem[];
	contextValue?: string;
}

// Gives data to treeview
class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
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

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "azure-api-center" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('azure-api-center.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Azure API Center!');
	});
	context.subscriptions.push(disposable);

	let openDocs = vscode.commands.registerCommand('azure-api-center.open-api-docs', async () => {
		await openOpenApiFile();
	});
	context.subscriptions.push(openDocs);

    let openPostman = vscode.commands.registerCommand('azure-api-center.open-postman', async () => {
		await openinPostman();
	});
	context.subscriptions.push(openPostman);

	const treeDataProvider = new TreeDataProvider();
	const treeView = vscode.window.createTreeView('apiCenterTreeView', { treeDataProvider });

    context.subscriptions.push(vscode.commands.registerCommand('azure-api-center.showTreeView', () => {
		treeView.reveal({ label: 'Parent 1' });
    }));
}

async function openinPostman(): Promise<void> {
    const postmanCommandId = 'postman-for-vscode.sidebar-panel.focus';
    vscode.commands.executeCommand(postmanCommandId);
}

async function openOpenApiFile(): Promise<void> {
    const data = await downloadOpenApiFile();
    const doc = await vscode.workspace.openTextDocument({ content: data.toString() });
    await vscode.window.showTextDocument(doc);
    // Using this extension for now... https://marketplace.visualstudio.com/items?itemName=Arjun.swagger-viewer
    const swaggerCommandId = 'swagger.preview';
    vscode.commands.executeCommand(swaggerCommandId);
}

async function downloadOpenApiFile(): Promise<string> {
    const url = 'https://conferenceapi.azurewebsites.net/?format=yaml';
    const response = await axios.get(url);

    return JSON.stringify(response.data, null, 4);
}

// This method is called when your extension is deactivated
export function deactivate() {}
