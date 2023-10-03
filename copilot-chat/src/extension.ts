import * as vscode from 'vscode';
import { basename } from 'path';
import { ProjectPreviewFileSystemProvider, fileSystemScheme } from './filesystemProvider';
import { API_CENTER_GENERATE_SNIPPET , API_CENTER_LIST_APIs, API_CENTER_FIND_API, API_CENTER_DESCRIBE_API } from './constants';
import { convertToInteractiveProgressFileTree, parseFileStructure } from './utils';

export function activate(context: vscode.ExtensionContext) {

    // Register the file system provider for the project file preview
    const fileSystemProvider = new ProjectPreviewFileSystemProvider();
    context.subscriptions.push(
        vscode.workspace.registerFileSystemProvider(fileSystemScheme, fileSystemProvider, { isReadonly: new vscode.MarkdownString(vscode.l10n.t('This is a preview of a Teams project.')) })
    );
    
    // Define a Teams chat agent. Agents appear as top-level options in the chat input
    // when you type `@`, and can contribute sub-commands in the chat input
    // that appear when you type `/`.
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

export function deactivate() { }
