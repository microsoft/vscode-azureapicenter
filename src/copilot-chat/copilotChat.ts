import * as vscode from 'vscode';
import { AzureAccountApi } from '../azure/azureAccount/azureAccountApi';
import { API_CENTER_DESCRIBE_API, API_CENTER_FIND_API, API_CENTER_LIST_APIs } from './constants';

export async function handleChatMessage(request: vscode.ChatAgentRequest, ctx: vscode.ChatAgentContext, progress: vscode.Progress<vscode.ChatAgentProgress>, token: vscode.CancellationToken): Promise<vscode.ChatAgentResult2> {
    const cmd = request.slashCommand?.name;

    let specificationsContent = '';

    if (['list', 'find'].includes(cmd ?? "")) {
        progress.report({ content: "\`>\` Querying data from Azure API Center...\n\n" });
        const azureAccountApi = new AzureAccountApi();
        const specifications = await azureAccountApi.getAllSpecifications();
        specificationsContent = specifications.map((specification, index) => `## Spec ${index + 1}:\n${specification.properties.value}\n`).join('\n');
    }

    if (cmd === 'list') {
        progress.report({ content: "\`>\` Parsing API Specifications...\n\n" });
        const access = await vscode.chat.requestChatAccess('copilot');
        const messages = [
            {
                role: vscode.ChatMessageRole.System,
                content: API_CENTER_LIST_APIs.replace("<SPECIFICATIONS>", specificationsContent)
            },
            {
                role: vscode.ChatMessageRole.User,
                content: 'What are APIs are available for me to use in Azure API Center?'
            },
        ];

        const platformRequest = access.makeRequest(messages, {}, token);
        for await (const fragment of platformRequest.response) {
            const incomingText = fragment.replace('[RESPONSE END]', '');
            progress.report({ content: incomingText });
        }
    } else if ((cmd === 'find')) {
        progress.report({ content: `\`>\` Parsing API Specifications for '${request.prompt}'...\n\n` });
        const access = await vscode.chat.requestChatAccess('copilot');
        const messages = [
            {
                role: vscode.ChatMessageRole.System,
                content: API_CENTER_FIND_API.replace("<SPECIFICATIONS>", specificationsContent)
            },
            {
                role: vscode.ChatMessageRole.User,
                content: `Find an API for '${request.prompt}' from the provided list in the system prompt.`
            },
        ];

        const platformRequest = access.makeRequest(messages, {}, token);
        for await (const fragment of platformRequest.response) {
            const incomingText = fragment.replace('[RESPONSE END]', '');
            progress.report({ content: incomingText });
        }
    } else if (cmd === '/generate') {

    } else if (cmd === 'describe') {
        const access = await vscode.chat.requestChatAccess('copilot');
        const messages = [
            {
                role: vscode.ChatMessageRole.System,
                content: API_CENTER_DESCRIBE_API
            },
            {
                role: vscode.ChatMessageRole.User,
                content: `Describe an API using the following specification: ${request.prompt}`
            },
        ];

        const platformRequest = access.makeRequest(messages, {}, token);
        for await (const fragment of platformRequest.response) {
            const incomingText = fragment.replace('[RESPONSE END]', '');
            progress.report({ content: incomingText });
        }
    }

    return {};
}
