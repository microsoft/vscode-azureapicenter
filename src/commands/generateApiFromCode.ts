// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from "fs";
import * as vscode from 'vscode';
import createContextWithTuple from "../common/promptContext";
import { ExceedTokenLimit, MODEL_SELECTOR } from "../constants";
import genSpecFromApi from "../prompts/generateApiSpecFromCode";
import { UiStrings } from "../uiStrings";
import { GeneralUtils } from "../utils/generalUtils";

export namespace GenerateApiFromCode {
    const retryCount = 5;
    const waitTimeMs = 1000;

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

                let prompt = genSpecFromApi(createContextWithTuple({ languageId, codeContent }));

                const messages = [
                    vscode.LanguageModelChatMessage.User(prompt),
                ];

                let llmResponseText = '';
                for (let i = 0; i < retryCount; i++) {
                    const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
                    const llmResponse = await model.sendRequest(messages, {}, new vscode.CancellationTokenSource().token);
                    llmResponseText = '';
                    for await (const fragment of llmResponse.text) {
                        llmResponseText += fragment;
                    }
                    if (!(llmResponseText.toLocaleLowerCase().includes('sorry') && (llmResponseText.includes('can\'t') || llmResponseText.includes('cannot')))) {
                        break;
                    }

                    await GeneralUtils.sleep(waitTimeMs);
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
}
