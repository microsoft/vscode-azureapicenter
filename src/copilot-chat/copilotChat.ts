import { IParsedError, parseError } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { ApiCenterApiVersionDefinitionExport } from '../azure/ApiCenter/contracts';
import { AzureAccountApi } from '../azure/azureAccount/azureAccountApi';
import { TelemetryClient } from '../common/telemetryClient';
import { ErrorProperties, TelemetryEvent } from '../common/telemetryEvent';
import { API_CENTER_FIND_API, API_CENTER_LIST_APIs } from './constants';

const specificationsCount = 3;
let index = 0;
let specifications: ApiCenterApiVersionDefinitionExport[] = [];
let promptFind = '';

export interface IChatAgentResult extends vscode.ChatAgentResult2 {
    slashCommand: string;
}

export async function handleChatMessage(request: vscode.ChatAgentRequest, ctx: vscode.ChatAgentContext, progress: vscode.Progress<vscode.ChatAgentProgress>, token: vscode.CancellationToken): Promise<IChatAgentResult> {
    const cmd = request.slashCommand?.name;
    const eventName = cmd ? `${TelemetryEvent.copilotChat}.${cmd}` : TelemetryEvent.copilotChat;
    let parsedError: IParsedError | undefined;

    try {
        TelemetryClient.sendEvent(`${eventName}.start`);

        let specificationsContent = '';

        if (!cmd) {
            progress.report({ content: 'Hi! What can I help you with? Please use `/list` or `/find` to chat with me!' });
            return { slashCommand: '' };
        }

        if (['list', 'find'].includes(cmd ?? "")) {
            if (request.prompt === '$more') {
                index += specificationsCount;
            } else {
                if (cmd === 'find') {
                    promptFind = request.prompt;
                }
                index = 0;
                progress.report({ content: "\`>\` Querying data from Azure API Center...\n\n" });
                const azureAccountApi = new AzureAccountApi();
                specifications = await azureAccountApi.getAllSpecifications();
            }
            const specificationsToShow = specifications.slice(index, index + specificationsCount);
            if (specificationsToShow.length === 0) {
                progress.report({ content: "\`>\` There are no more API Specifications.\n\n" });
                return { slashCommand: '' };
            }
            specificationsContent = specificationsToShow.map((specification, index) => `## Spec ${index + 1}:\n${specification.value}\n`).join('\n');
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
            return { slashCommand: 'list' };
        } else if ((cmd === 'find')) {
            progress.report({ content: `\`>\` Parsing API Specifications for '${promptFind}'...\n\n` });
            const access = await vscode.chat.requestChatAccess('copilot');
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: API_CENTER_FIND_API.replace("<SPECIFICATIONS>", specificationsContent)
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: `Find an API for '${promptFind}' from the provided list in the system prompt.`
                },
            ];

            const platformRequest = access.makeRequest(messages, {}, token);
            for await (const fragment of platformRequest.response) {
                const incomingText = fragment.replace('[RESPONSE END]', '');
                progress.report({ content: incomingText });
            }
            return { slashCommand: 'find' };
        }

        return { slashCommand: '' };
    } catch (error) {
        parsedError = parseError(error);
        throw error;
    } finally {
        if (parsedError) {
            TelemetryClient.sendErrorEvent(`${eventName}.end`, {
                [ErrorProperties.errorType]: parsedError.errorType,
                [ErrorProperties.errorMessage]: parsedError.message,
            });
        } else {
            TelemetryClient.sendEvent(`${eventName}.end`);
        }
    }
}
