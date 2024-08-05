// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AgentRequest, GetPluginsCommandResult, ILocalPluginHandler, LocalPluginArgs, LocalPluginEntry, LocalPluginManifest, PluginHelpers } from "copilot-for-azure-vscode-api";

const genApiRuleFunctionName = "genApiRule";

const apicPluginManifest: LocalPluginManifest = {
    name: "AzureAPICenterPlugin",
    version: "1.0.0",
    functions: [
        {
            name: genApiRuleFunctionName,
            description: "Generate Spectral API Rule for OpenAPI.",
            parameters: [],
            returnParameter: null,
            willHandleUserResponse: true
        }
    ]
};

async function handleGenApiRule(agentRequest: AgentRequest, pluginHelpers: PluginHelpers): Promise<void> {
    agentRequest.responseStream.progress("Invoking Azure API Center...");

    if (agentRequest.token.isCancellationRequested) {
        return;
    }

    const prompt = `Please be professional, and use below infomation to generate a Spectral rule:
${agentRequest.userPrompt}`;
    await pluginHelpers.languageModelHelper.verbatimLanguageModelInteraction(prompt, agentRequest);

    agentRequest.responseStream.markdown("\n\nYou could set the active API Style Guide to lint your API:");
    agentRequest.responseStream.button({
        title: "$(run) Set active API Style Guide",
        command: "azure-api-center.setApiRuleset",
        arguments: []
    });
    agentRequest.responseStream.markdown("--DONE--");
}

const azdPluginHandler: ILocalPluginHandler = {
    execute: async (args: LocalPluginArgs<typeof genApiRuleFunctionName>) => {
        const pluginRequest = args.localPluginRequest;
        if (pluginRequest.functionName === genApiRuleFunctionName) {
            await handleGenApiRule(args.agentRequest, args.pluginHelpers);
            return { status: "success" };
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
