// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from "fs";
import * as vscode from 'vscode';
import { ExceedTokenLimit, MODEL_SELECTOR } from "../constants";
import { UiStrings } from "../uiStrings";
import { sleep } from "../utils/generalUtils";

export async function generateApiFromCode(context: IActionContext) {
    const activeEditor = vscode.window.activeTextEditor;

    if (!activeEditor) {
        throw new Error(UiStrings.NoActiveFileOpen);
    }

    const languageId = activeEditor.document.languageId;
    const fileUri = activeEditor.document.uri;

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: UiStrings.GeneratingOpenAPI
    }, async (progress, token) => {
        try {
            const codeContent = await fs.promises.readFile(fileUri.fsPath, { encoding: 'utf-8' });

            const messages = [
                vscode.LanguageModelChatMessage.User(`You are an expert in ${languageId} programming language and OpenAPI.
Generate the OpenAPI Specification from the provided ${languageId} programming language.
Try your best to parse the code and understand the code structure.
Only return the specification content with YAML format, without any additional information.
If the code is not REST API related, return "Not REST API related code" and provide an explanation.
If this task can't be completed, return "Sorry, I can't assist" and provide an explanation.
Here's the ${languageId} code of Web API:
\`\`\`
${codeContent}
\`\`\``),
            ];

            let llmResponseText = '';
            for (let i = 0; i < 5; i++) {
                const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
                const llmResponse = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
                llmResponseText = '';
                for await (const fragment of llmResponse.text) {
                    llmResponseText += fragment;
                }
                if (!(llmResponseText.toLocaleLowerCase().includes('sorry') && (llmResponseText.includes('can\'t') || llmResponseText.includes('cannot')))) {
                    break;
                }
                await sleep(1000);
            }

            let language;
            let openApiContent;

            const codeBlockMatch = llmResponseText.match(/```(\w+)?\n([\s\S]*?)```/);

            if (codeBlockMatch) {
                language = codeBlockMatch[1];
                openApiContent = codeBlockMatch[2];
            } else {
                openApiContent = llmResponseText;
            }

            openApiContent = `# ${UiStrings.AIContentIncorrect}\n${openApiContent}`;

            const document = await vscode.workspace.openTextDocument({
                language: language,
                content: openApiContent
            });
            await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);
        } catch (error) {
            if (error instanceof vscode.LanguageModelError && error.cause instanceof Error) {
                if (error.cause.message.includes(ExceedTokenLimit)) {
                    throw new Error(UiStrings.CopilotExceedsTokenLimit);
                } else {
                    throw new Error(error.cause.message);
                }
            }
            throw error;
        }
    });
}
