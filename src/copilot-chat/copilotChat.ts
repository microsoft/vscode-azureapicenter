// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IParsedError, parseError } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { AzureAccountApi } from '../azure/azureAccount/azureAccountApi';
import { ApiCenterApiVersionDefinitionExportWithType } from '../common/interfaces';
import { TelemetryClient } from '../common/telemetryClient';
import { ErrorProperties, TelemetryEvent } from '../common/telemetryEvent';
import { UiStrings } from '../uiStrings';
import { OpenApiUtils } from '../utils/openApiUtils';
import { API_CENTER_FIND_API, API_CENTER_LIST_APIs } from './constants';

const LANGUAGE_MODEL_ID = 'copilot-gpt-3.5-turbo';
const specificationsCount = 1;
let index = 0;
let specifications: ApiCenterApiVersionDefinitionExportWithType[] = [];
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
            stream.markdown(UiStrings.CopilotNoCmd);
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
                stream.progress(UiStrings.CopilotQueryData);
                const azureAccountApi = new AzureAccountApi();
                specifications = await azureAccountApi.getAllSpecifications();
            }
            const specificationsToShow = specifications.slice(index, index + specificationsCount);
            if (specificationsToShow.length === 0) {
                stream.markdown(UiStrings.CopilotNoMoreApiSpec);
                return { metadata: { command: '' } };
            }
            specificationsContent = (await Promise.all(specificationsToShow.map(async (specification, index) => {
                let specificationContent = specification.value;
                if (specification.type === 'openapi') {
                    try {
                        const openApi = await OpenApiUtils.pasreDefinitionFileRawToOpenAPIV3FullObject(specification.value);
                        const compressedOpenApi = OpenApiUtils.compressOpenAPIV3(openApi);
                        specificationContent = JSON.stringify(compressedOpenApi);
                    } catch (error) {
                        // Do not throw error if it fails to compress OpenAPI.
                        // Just use the original value, and let LLM have chance to parse it.
                        // For exmaple, if the OpenAPI is not valid, it fails to compress it, but LLM may still parse it.
                    }
                }
                return `## Spec ${index + 1}:\n${specificationContent}\n`;
            }))).join('\n');
        }

        if (cmd === 'list') {
            stream.progress(UiStrings.CopilotParseApiSpec);
            const messages = [
                new vscode.LanguageModelChatSystemMessage(API_CENTER_LIST_APIs.replace("<SPECIFICATIONS>", specificationsContent)),
                new vscode.LanguageModelChatUserMessage("What are APIs are available for me to use in Azure API Center?"),
            ];

            const chatResponse = await vscode.lm.sendChatRequest(LANGUAGE_MODEL_ID, messages, {}, token);
            for await (const fragment of chatResponse.stream) {
                stream.markdown(fragment);
            }
            return { metadata: { command: 'list' } };
        } else if ((cmd === 'find')) {
            stream.progress(vscode.l10n.t(UiStrings.CopilotParseApiSpecFor, promptFind));
            const messages = [
                new vscode.LanguageModelChatSystemMessage(API_CENTER_FIND_API.replace("<SPECIFICATIONS>", specificationsContent)),
                new vscode.LanguageModelChatUserMessage(`Find an API for '${promptFind}' from the provided list in the system prompt.`),
            ];

            const chatResponse = await vscode.lm.sendChatRequest(LANGUAGE_MODEL_ID, messages, {}, token);
            for await (const fragment of chatResponse.stream) {
                stream.markdown(fragment);
            }
            return { metadata: { command: 'find' } };
        }

        return { metadata: { command: '' } };
    } catch (error) {
        parsedError = parseError(error);
        if (error instanceof vscode.LanguageModelError && (error as any).cause?.message?.includes("Message exceeds token limit")) {
            stream.markdown(UiStrings.CopilotExceedsTokenLimit);
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
