import * as vscode from 'vscode';

// Commands
import { OpenApiFileOpener } from './commands/openApiDocCommand';
import { PostmanOpener } from './commands/openPostmanCommand';

// User Interface
import { ApiCenterTreeDataProvider } from './ui/apiCenterTreeViewProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "azure-api-center" is now active!');

    // Show the API Center tree view
    const treeDataProvider = new ApiCenterTreeDataProvider();
	const treeView = vscode.window.createTreeView('apiCenterTreeView', { treeDataProvider });

    context.subscriptions.push(vscode.commands.registerCommand('azure-api-center.showTreeView', () => {
		treeView.reveal({ label: 'Parent 1' });
    }));

    // Register API Center extension commands
	let helloWorldCommand = vscode.commands.registerCommand('azure-api-center.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Azure API Center!');
	});

	let openApiDocsCommand = vscode.commands.registerCommand('azure-api-center.open-api-docs', async () => {
		const opener = new OpenApiFileOpener();
        await opener.open();
	});

    let openPostmanCommand = vscode.commands.registerCommand('azure-api-center.open-postman', async () => {
		const postmanOpener = new PostmanOpener();
        await postmanOpener.open();
	});


    context.subscriptions.push(helloWorldCommand);
	context.subscriptions.push(openApiDocsCommand);
    context.subscriptions.push(openPostmanCommand);
}

export function deactivate() {}