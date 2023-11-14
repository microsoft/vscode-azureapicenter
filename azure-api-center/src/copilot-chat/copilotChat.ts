import * as vscode from 'vscode';
import { AzureAccountApi } from '../azure/azureAccount/azureAccountApi';
import { API_CENTER_DESCRIBE_API, API_CENTER_LIST_APIs } from './constants';

export async function handleChatMessage(prompt: vscode.ChatMessage, ctx: vscode.ChatAgentContext, progress: vscode.Progress<vscode.ChatAgentReplyFollowup>, token: vscode.CancellationToken): Promise<vscode.ChatAgentResult2 | void> {
    // To talk to an LLM in your slash command handler implementation, your
    // extension can use VS Code's `requestChatAccess` API to access the Copilot API.
    // The pre-release of the GitHub Copilot Chat extension implements this provider.
    if (prompt.content.startsWith('/list')) {
        try {
            const azureAccountApi = new AzureAccountApi();
            const specifications = await azureAccountApi.getAllSpecifications();
            const access = await vscode.chat.requestChatAccess('copilot');
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: API_CENTER_LIST_APIs.replace("<SPECIFICATIONS>", specifications.map((specification, index) => `## Spec ${index}:\n${specification.properties.value}\n`).join('\n'))
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: 'What are APIs are available for me to use in Azure API Center?'
                },
            ];

            const platformRequest = await access.makeRequest(messages, {}, token);
            for await (const fragment of platformRequest.response) {
                const incomingText = fragment.replace('[RESPONSE END]', '');
                progress.report({ message: incomingText });
            }
        } catch (error) {
            console.log(error);
        }


        return {

        };
    } else if (prompt.content.startsWith('/find')) {
        // const access = await vscode.chat.requestChatAccess('copilot');
        // const messages = [
        //     {
        //         role: vscode.ChatMessageRole.System,
        //         content: API_CENTER_FIND_API
        //     },
        //     {
        //         role: vscode.ChatMessageRole.User,
        //         content: `Find an API for ${prompt.content.split(' ')[1]} from the provided list in the system prompt.`
        //     },
        // ];

        // await access.makeRequest(messages, {}, {
        //     report: (fragment: vscode.ChatResponseFragment) => {
        //         const incomingText = fragment.part.replace('[RESPONSE END]', '');
        //         progress.report({ message: new vscode.MarkdownString(incomingText) });
        //     }
        // }, token);

        return {

        };
    } else if (prompt.content.startsWith('/generate')) {
        // const access = await vscode.chat.requestChatAccess('copilot');
        // const messages = [
        //     {
        //         role: vscode.ChatMessageRole.System,
        //         content: API_CENTER_GENERATE_SNIPPET
        //     },
        //     {
        //         role: vscode.ChatMessageRole.User,
        //         content: `Generate a code snippet for API specification ${prompt.content.split(' ')[1]} and language ${prompt.content.split(' ')[2]}`
        //     },
        // ];

        // await access.makeRequest(messages, {}, {
        //     report: (fragment: vscode.ChatResponseFragment) => {
        //         const incomingText = fragment.part.replace('[RESPONSE END]', '');
        //         progress.report({ message: new vscode.MarkdownString(incomingText) });
        //     }
        // }, token);
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

        const platformRequest = await access.makeRequest(messages, {}, token);
        for await (const fragment of platformRequest.response) {
            const incomingText = fragment.replace('[RESPONSE END]', '');
            progress.report({ message: incomingText });
        }

        return {

        };
    }
}
