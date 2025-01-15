// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from "vscode";
import { AgentRequest, LocalPluginResult, PluginHelpers } from "../types/AzureAgent";

export async function generateOpenApiFromProject(agentRequest: AgentRequest, pluginHelpers: PluginHelpers): Promise<LocalPluginResult> {

    const codebaseResult: vscode.LanguageModelToolResult = await vscode.lm.invokeTool("copilot_codebase", {
        // codebase tool shipped in VS Code Insider 1.96.0 uses this `input` parameter to get the input query
        input: { query: "Find all the routes files and models files, only include files of Programming Languages." },
        toolInvocationToken: agentRequest.toolInvocationToken,
    });

    const resultElement = (codebaseResult.content.at(0) as vscode.LanguageModelTextPart | vscode.LanguageModelPromptTsxPart)?.value;

    const prmopt = getPromptOfRelevantFiles(resultElement);

    agentRequest.responseStream.markdown("--START--");
    await pluginHelpers.languageModelHelper.verbatimLanguageModelInteraction("what is azd? do not return other output", agentRequest);

    const llmOutput = await pluginHelpers.languageModelHelper.getResponseAsStringLanguageModelInteraction("what is azd? do not return other output", agentRequest);
    agentRequest.responseStream.markdown("--DONE--");

    return {
        status: "Success"
    };
}

function getPromptOfRelevantFiles(resultElement: any): string {
    let prompt = "";
    (resultElement.node.children[0].children as any[]).forEach((child, index) => {
        const file = `----${index}----\n${child.children[0].text}`;
        prompt += file;
    });
    return prompt;
}
