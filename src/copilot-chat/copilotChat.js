"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChatMessage = void 0;
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const vscode = require("vscode");
const azureAccountApi_1 = require("../azure/azureAccount/azureAccountApi");
const telemetryClient_1 = require("../common/telemetryClient");
const telemetryEvent_1 = require("../common/telemetryEvent");
const constants_1 = require("./constants");
const specificationsCount = 3;
let index = 0;
let specifications = [];
let promptFind = '';
async function handleChatMessage(request, ctx, progress, token) {
    const cmd = request.slashCommand?.name;
    const eventName = cmd ? `${telemetryEvent_1.TelemetryEvent.copilotChat}.${cmd}` : telemetryEvent_1.TelemetryEvent.copilotChat;
    let parsedError;
    try {
        telemetryClient_1.TelemetryClient.sendEvent(`${eventName}.start`);
        let specificationsContent = '';
        if (!cmd) {
            progress.report({ content: 'Hi! What can I help you with? Please use `/list` or `/find` to chat with me!' });
            return { slashCommand: '' };
        }
        if (['list', 'find'].includes(cmd ?? "")) {
            if (request.prompt === '$more') {
                index += specificationsCount;
            }
            else {
                if (cmd === 'find') {
                    promptFind = request.prompt;
                }
                index = 0;
                progress.report({ content: "\`>\` Querying data from Azure API Center...\n\n" });
                const azureAccountApi = new azureAccountApi_1.AzureAccountApi();
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
                    content: constants_1.API_CENTER_LIST_APIs.replace("<SPECIFICATIONS>", specificationsContent)
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
        }
        else if ((cmd === 'find')) {
            progress.report({ content: `\`>\` Parsing API Specifications for '${promptFind}'...\n\n` });
            const access = await vscode.chat.requestChatAccess('copilot');
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: constants_1.API_CENTER_FIND_API.replace("<SPECIFICATIONS>", specificationsContent)
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
    }
    catch (error) {
        parsedError = (0, vscode_azext_utils_1.parseError)(error);
        throw error;
    }
    finally {
        if (parsedError) {
            telemetryClient_1.TelemetryClient.sendErrorEvent(`${eventName}.end`, {
                [telemetryEvent_1.ErrorProperties.errorType]: parsedError.errorType,
                [telemetryEvent_1.ErrorProperties.errorMessage]: parsedError.message,
            });
        }
        else {
            telemetryClient_1.TelemetryClient.sendEvent(`${eventName}.end`);
        }
    }
}
exports.handleChatMessage = handleChatMessage;
//# sourceMappingURL=copilotChat.js.map