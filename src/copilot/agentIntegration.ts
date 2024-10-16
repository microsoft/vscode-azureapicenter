// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from 'vscode';
import { LocalPluginManifest } from "../types/AiDriver";
import { AgentRequest, GetPluginsCommandResult, ILocalPluginHandler, LocalPluginArgs, LocalPluginEntry, LocalPluginResult } from "../types/AzureAgent";

const genOpenApiFunctionName = "generate_openapi";

const apicPluginManifest: LocalPluginManifest = {
    extensionId: "apidev.azure-api-center",
    extensionDisplayName: "Azure API Center",
    name: "ApiCenterPlugin",
    version: "1.0.0",
    functions: [
        {
            name: genOpenApiFunctionName,
            parameters: [],
            returnParameter: {
                type: "object"
            },
        }
    ],
};

async function handleGenOpenApi(agentRequest: AgentRequest): Promise<LocalPluginResult> {
    agentRequest.responseStream.progress("Invoking Azure API Center...");

    const responseForLanguageModel = {
        result: `Please be professional, and use below infomation to generate an OpenAPI specification documentation with YAML format:
${agentRequest.userPrompt}

In addition, make sure the OpenAPI spec meet with below rules:
Property names must be upper case snake`,
    };

    const chatResponseParts: vscode.ChatResponsePart[] = [];
    chatResponseParts.push(new vscode.ChatResponseMarkdownPart("\n\n**It is From APIC extension!!!**"));

    return {
        responseForLanguageModel: responseForLanguageModel,
        chatResponseParts: chatResponseParts
    };
}

const azdPluginHandler: ILocalPluginHandler = {
    execute: async (args: LocalPluginArgs<typeof genOpenApiFunctionName>) => {
        const pluginRequest = args.localPluginRequest;
        if (pluginRequest.functionName === genOpenApiFunctionName) {
            return await handleGenOpenApi(args.agentRequest);
        } else {
            return {
                status: "error",
                message: "Unrecognized pathname."
            };
        }
    }
};

const apicPlugin: LocalPluginEntry = {
    manifest: apicPluginManifest,
    handler: azdPluginHandler
};

export async function getPluginsCommand(): Promise<GetPluginsCommandResult> {
    return {
        plugins: [apicPlugin]
    };
}
