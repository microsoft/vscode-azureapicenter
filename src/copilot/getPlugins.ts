// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { extensionDisplayName, extensionId } from "../constants";
import { LocalPluginManifest } from "../types/AiDriver";
import { GetPluginsCommandResult, ILocalPluginHandler, LocalPluginArgs, LocalPluginEntry } from "../types/AzureAgent";
import { handleGenerateOpenApi } from "./generateOpenApi";

const genOpenApiFunctionName = "generate_openapi";

const apicPluginManifest: LocalPluginManifest = {
    extensionId: extensionId,
    extensionDisplayName: extensionDisplayName,
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

const apicPluginHandler: ILocalPluginHandler = {
    execute: async (args: LocalPluginArgs<typeof genOpenApiFunctionName>) => {
        const pluginRequest = args.localPluginRequest;
        if (pluginRequest.functionName === genOpenApiFunctionName) {
            return await handleGenerateOpenApi(args.agentRequest);
        } else {
            return { result: "Error: Function not found." };
        }
    }
};

const apicPlugin: LocalPluginEntry = {
    manifest: apicPluginManifest,
    handler: apicPluginHandler
};

export async function getPlugins(): Promise<GetPluginsCommandResult> {
    return {
        plugins: [apicPlugin]
    };
};
