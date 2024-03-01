import { IParsedError, parseError } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { ApiCenterApiVersionDefinitionExport } from '../azure/ApiCenter/contracts';
import { AzureAccountApi } from '../azure/azureAccount/azureAccountApi';
import { TelemetryClient } from '../common/telemetryClient';
import { ErrorProperties, TelemetryEvent } from '../common/telemetryEvent';
import { API_CENTER_FIND_API, API_CENTER_LIST_APIs } from './constants';

const LANGUAGE_MODEL_ID = 'copilot-gpt-3.5-turbo';
const specificationsCount = 1;
let index = 0;
let specifications: ApiCenterApiVersionDefinitionExport[] = [];
let promptFind = '';

export interface IChatResult extends vscode.ChatResult {
    metadata: {
        command: string;
    }
}

export async function handleChatMessage(request: vscode.ChatRequest, ctx: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken): Promise<IChatResult> {
    const cmd = request.command;
    const eventName = cmd ? `${TelemetryEvent.copilotChat}.${cmd}` : TelemetryEvent.copilotChat;
    let parsedError: IParsedError | undefined;

    try {
        TelemetryClient.sendEvent(`${eventName}.start`);

        let specificationsContent = '';

        if (!cmd) {
            stream.markdown('Hi! What can I help you with? Please use `/list` or `/find` to chat with me!');
            return { metadata: { command: '' } };
        }

        if (['list', 'find'].includes(cmd ?? "")) {
            if (request.prompt === '$more') {
                index += specificationsCount;
            } else {
                if (cmd === 'find') {
                    promptFind = request.prompt;
                }
                index = 0;
                stream.progress("Querying data from Azure API Center...\n\n");
                const azureAccountApi = new AzureAccountApi();
                specifications = await azureAccountApi.getAllSpecifications();
            }
            const specificationsToShow = specifications.slice(index, index + specificationsCount);
            if (specificationsToShow.length === 0) {
                stream.markdown("\`>\` There are no more API Specifications.\n\n");
                return { metadata: { command: '' } };
            }
            specificationsContent = specificationsToShow.map((specification, index) => `## Spec ${index + 1}:\n${specification.value}\n`).join('\n');
        }

        if (cmd === 'list') {
            stream.progress("Parsing API Specifications...\n\n");
            const access = await vscode.lm.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const messages = [
                new vscode.LanguageModelSystemMessage(API_CENTER_LIST_APIs.replace("<SPECIFICATIONS>", specificationsContent)),
                new vscode.LanguageModelUserMessage("What are APIs are available for me to use in Azure API Center?"),
            ];

            const chatRequest = access.makeChatRequest(messages, {}, token);
            await chatRequest.result;
            for await (const fragment of chatRequest.stream) {
                stream.markdown(fragment);
            }
            return { metadata: { command: 'list' } };
        } else if ((cmd === 'find')) {
            stream.progress(`Parsing API Specifications for '${promptFind}'...\n\n`);
            const access = await vscode.lm.requestLanguageModelAccess(LANGUAGE_MODEL_ID);
            const messages = [
                new vscode.LanguageModelSystemMessage(API_CENTER_FIND_API.replace("<SPECIFICATIONS>", specificationsContent)),
                new vscode.LanguageModelUserMessage(`Find an API for '${promptFind}' from the provided list in the system prompt.`),
            ];

            const chatRequest = access.makeChatRequest(messages, {}, token);
            await chatRequest.result;
            for await (const fragment of chatRequest.stream) {
                stream.markdown(fragment);
            }
            return { metadata: { command: 'find' } };
        }

        return { metadata: { command: '' } };
    } catch (error) {
        parsedError = parseError(error);
        if (parsedError.message?.includes("Message exceeds token limit")) {
            stream.markdown("⚠️ The content of API Spec exceeds the token limit of Copilot Chat LLM. Please try with below action.");
            return { metadata: { command: cmd! } };
        }
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
