import * as vscode from 'vscode';
import { commands } from "vscode";

// Commands
import { OpenApiFileOpener } from './commands/openApiDocCommand';
import { PostmanOpener } from './commands/openPostmanCommand';
import { GenerateApiLibrary } from './commands/generateLibraryCommand';

// Copilot
import { API_CENTER_LIST_APIs, API_CENTER_FIND_API, API_CENTER_DESCRIBE_API, API_CENTER_GENERATE_SNIPPET } from './copilot-chat/constants';

// Tree View UI
import { ext } from './extensionVariables';
import { AzExtTreeDataProvider, AzExtTreeItem, IActionContext, createAzExtOutputChannel, registerCommand, registerEvent } from '@microsoft/vscode-azext-utils';
import { registerAzureUtilsExtensionVariables } from '@microsoft/vscode-azext-azureutils';
import { AzureAccountTreeItem } from './tree/AzureAccountTreeItem';
import { ApiVersionDefinitionTreeItem } from './tree/ApiVersionDefinitionTreeItem';
import { importOpenApi } from './commands/importOpenApi';
import { exportOpenApi } from './commands/exportOpenApi';
import { OpenApiEditor } from './tree/Editors/openApi/OpenApiEditor';
import { doubleClickDebounceDelay, selectedNodeKey } from './constants';
import { refreshTree } from './commands/refreshTree';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "azure-api-center" is now active!');

    // https://github.com/microsoft/vscode-azuretools/tree/main/azure
    ext.context = context;
    ext.outputChannel = createAzExtOutputChannel('Azure API Center', ext.prefix);
    context.subscriptions.push(ext.outputChannel);
    registerAzureUtilsExtensionVariables(ext);

    const azureAccountTreeItem = new AzureAccountTreeItem();
    context.subscriptions.push(azureAccountTreeItem);
    ext.treeItem = azureAccountTreeItem;

    const treeDataProvider = new AzExtTreeDataProvider(azureAccountTreeItem, "appService.loadMore");

    const treeView = vscode.window.createTreeView("apiCenterTreeView", { treeDataProvider });
    context.subscriptions.push(treeView);

    treeView.onDidChangeSelection((e: vscode.TreeViewSelectionChangeEvent<AzExtTreeItem>) => {
      const selectedNode = e.selection[0];
      ext.outputChannel.appendLine(selectedNode.id!);
      ext.context.globalState.update(selectedNodeKey, selectedNode.id);
    });
    
    // Register API Center extension commands
    registerCommand('azure-api-center.selectSubscriptions', () => commands.executeCommand('azure-account.selectSubscriptions'));
    registerCommand('azure-api-center.importOpenApiByFile', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await importOpenApi(context, node, false); });
    registerCommand('azure-api-center.importOpenApiByLink', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await importOpenApi(context, node, true); });
    registerCommand('azure-api-center.exportOpenApi', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await exportOpenApi(context, node); });

    const openApiEditor: OpenApiEditor = new OpenApiEditor();
    context.subscriptions.push(openApiEditor);
    registerEvent('azure-api-center.openApiEditor.onDidSaveTextDocument',
                  vscode.workspace.onDidSaveTextDocument,
                  async (actionContext: IActionContext, doc: vscode.TextDocument) => { await openApiEditor.onDidSaveTextDocument(actionContext, context.globalState, doc); });
    
    registerCommand('azure-api-center.showOpenApi', async (actionContext: IActionContext, node?: ApiVersionDefinitionTreeItem) => {
        if (!node) {
            node = <ApiVersionDefinitionTreeItem>await ext.treeDataProvider.showTreeItemPicker(ApiVersionDefinitionTreeItem.contextValue, actionContext);
        }
        await openApiEditor.showEditor(node);
        vscode.commands.executeCommand('setContext', 'isEditorEnabled', true);
    },              doubleClickDebounceDelay);

    registerCommand('azure-api-center.open-api-docs', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => {
        await openApiEditor.showEditor(node!);
    
        const opener = new OpenApiFileOpener();
        await opener.open();
	});

    registerCommand('azure-api-center.open-postman', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => {
        await openApiEditor.showEditor(node!);

		const postmanOpener = new PostmanOpener();
        await postmanOpener.open();
	});

	registerCommand('azure-api-center.generate-api-client', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => {
        const path = await openApiEditor.showEditor(node!);
        
        const apiLibraryGenerator = new GenerateApiLibrary();
        await apiLibraryGenerator.generate(path);
	});

    registerCommand('azure-api-center.apiCenterTreeView.refresh', async (context: IActionContext) => refreshTree(context));

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
}

export function deactivate() {}