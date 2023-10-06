import * as vscode from 'vscode';
import { API_CENTER_GENERATE_SNIPPET , API_CENTER_LIST_APIs, API_CENTER_FIND_API, API_CENTER_DESCRIBE_API } from './constants';

export class ChatAgent {
    async handleChatMessage(prompt: vscode.ChatMessage, ctx: vscode.ChatAgentContext, progress: vscode.Progress<vscode.ChatAgentResponse>, token: vscode.CancellationToken): Promise<vscode.ChatAgentResult | void> {
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
    }
}