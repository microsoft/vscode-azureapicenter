import * as vscode from 'vscode';

// API
import { Auth } from './api/auth';

// Commands
import { OpenApiFileOpener } from './commands/openApiDocCommand';
import { PostmanOpener } from './commands/openPostmanCommand';
import { GenerateApiLibrary } from './commands/generateLibraryCommand';

// Copilot
import { API_CENTER_LIST_APIs, API_CENTER_FIND_API, API_CENTER_GENERATE_SNIPPET } from './copilot-chat/constants';

// User Interface
import { ApiCenterTreeDataProvider } from './ui/apiCenterTreeViewProvider';
import { API_CENTER_DESCRIBE_API } from './copilot-chat/constants';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "azure-api-center" is now active!');

    // Show the API Center tree view
    const treeDataProvider = new ApiCenterTreeDataProvider();
	const treeView = vscode.window.createTreeView('apiCenterTreeView', { treeDataProvider });

    context.subscriptions.push(vscode.commands.registerCommand('azure-api-center.showTreeView', () => {
		treeView.reveal({ label: 'Parent 1' });
    }));

    // Register API Center extension commands
	let signInCommand = vscode.commands.registerCommand('azure-api-center.signIn', async () => {
		const auth = new Auth();
		auth.getToken();
	});

	let openApiDocsCommand = vscode.commands.registerCommand('azure-api-center.open-api-docs', async () => {
		const opener = new OpenApiFileOpener();
        await opener.open();
	});

    let openPostmanCommand = vscode.commands.registerCommand('azure-api-center.open-postman', async () => {
		const postmanOpener = new PostmanOpener();
        await postmanOpener.open();
	});

	let generateApiClientCommand = vscode.commands.registerCommand('azure-api-center.generate-api-client', async () => {
		const apiLibraryGenerator = new GenerateApiLibrary();
        await apiLibraryGenerator.generate();
	});

	const chatAgent = async (prompt: vscode.ChatMessage, ctx: vscode.ChatAgentContext, progress: vscode.Progress<vscode.ChatAgentResponse>, token: vscode.CancellationToken): Promise<vscode.ChatAgentResult | void> => {
        // To talk to an LLM in your slash command handler implementation, your
        // extension can use VS Code's `requestChatAccess` API to access the Copilot API.
        // The pre-release of the GitHub Copilot Chat extension implements this provider.
        if (prompt.content.startsWith('/list')) {
            const access = await vscode.chat.requestChatAccess('copilot');
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: API_CENTER_LIST_APIs
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: 'What are APIs are available for me to use in Azure API Center?'
                },
            ];
            await access.makeRequest(messages, {}, {
                report: (fragment: vscode.ChatResponseFragment) => {
                    const incomingText = fragment.part.replace('[RESPONSE END]', '');
                    progress.report({ message: new vscode.MarkdownString(incomingText) });
                }
            }, token);

            return {
                followUp: [{ message: vscode.l10n.t('@apicenter /find search_query'), metadata: {} }]
            };
        } else if (prompt.content.startsWith('/find')) {
            const access = await vscode.chat.requestChatAccess('copilot');
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: API_CENTER_FIND_API
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: `Find an API for ${prompt.content.split(' ')[1]} from the provided list in the system prompt.`
                },
            ];

            await access.makeRequest(messages, {}, {
                report: (fragment: vscode.ChatResponseFragment) => {
                    const incomingText = fragment.part.replace('[RESPONSE END]', '');
                    progress.report({ message: new vscode.MarkdownString(incomingText) });
                }
            }, token);

            return {
                followUp: [{ message: vscode.l10n.t('@apicenter /describe api'), metadata: {} }]
            };
        }  else if (prompt.content.startsWith('/generate')) {
            const access = await vscode.chat.requestChatAccess('copilot');
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: API_CENTER_GENERATE_SNIPPET
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: `Generate a code snippet for API specification ${prompt.content.split(' ')[1]} and language ${prompt.content.split(' ')[2]}`
                },
            ];

            await access.makeRequest(messages, {}, {
                report: (fragment: vscode.ChatResponseFragment) => {
                    const incomingText = fragment.part.replace('[RESPONSE END]', '');
                    progress.report({ message: new vscode.MarkdownString(incomingText) });
                }
            }, token);
        } else if (prompt.content.startsWith('/describe')) {
            const access = await vscode.chat.requestChatAccess('copilot');
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: API_CENTER_DESCRIBE_API
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: `Describe an API using the following specification ${prompt.content}`
                },
            ];

            await access.makeRequest(messages, {}, {
                report: (fragment: vscode.ChatResponseFragment) => {
                    const incomingText = fragment.part.replace('[RESPONSE END]', '');
                    progress.report({ message: new vscode.MarkdownString(incomingText) });
                }
            }, token);

            return {
                followUp: [{ message: vscode.l10n.t('@apicenter /generate spec language'), metadata: {} }]
            };
        } 
	};

	context.subscriptions.push(
        // Register the Teams chat agent with two subcommands, /generate and /examples
        vscode.chat.registerAgent('apicenter', chatAgent, {
            description: 'Interact with API Center APIs.',
            subCommands: [
                { name: 'find', description: 'Find an API.' },
                { name: 'list', description: 'List APIs available to me.' },
                { name: 'describe', description: 'Describe an API.' },
                { name: 'generate', description: 'Generate a code snippet to call an API.' },
            ],
        })
    );

    context.subscriptions.push(signInCommand);
	context.subscriptions.push(openApiDocsCommand);
    context.subscriptions.push(openPostmanCommand);
	context.subscriptions.push(generateApiClientCommand);
}

export function deactivate() {}