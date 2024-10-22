// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IParsedError, parseError } from "@microsoft/vscode-azext-utils";
import { TelemetryClient } from "../common/telemetryClient";
import { ErrorProperties } from "../common/telemetryEvent";
import { extensionDisplayName, extensionId } from "../constants";
import { LocalPluginManifest } from "../types/AiDriver";
import { GetPluginsCommandResult, ILocalPluginHandler, LocalPluginArgs, LocalPluginEntry } from "../types/AzureAgent";
import { GenerateOpenApi } from "./generateOpenApi";

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
        const eventName = `azure-api-center.agent.${pluginRequest.functionName}`;
        let parsedError: IParsedError | undefined;

        try {
            TelemetryClient.sendEvent(`${eventName}.start`);
            if (pluginRequest.functionName === genOpenApiFunctionName) {
                return await GenerateOpenApi.handleGenerateOpenApi(args.agentRequest);
            } else {
                return { result: "Error: Function not found." };
            }
        } catch (error) {
            parsedError = parseError(error);
            throw error;
        } finally {
            if (parsedError) {
                const properties = {
                    [ErrorProperties.errorType]: parsedError.errorType,
                    [ErrorProperties.errorMessage]: parsedError.message,
                };
                TelemetryClient.sendErrorEvent(`${eventName}.end`, properties);
            } else {
                TelemetryClient.sendEvent(`${eventName}.end`);
            }
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
