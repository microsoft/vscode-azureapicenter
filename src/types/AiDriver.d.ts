/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// This file contains the types used to communicate with our AI Driver service.
// These types should be kept in sync with the .NET types located in the AI Driver project.
//
// This file should not contain types that are specific to things happening in the client (in this
// case, the @azure VS Code extension. For example, types related to the extension's local plugin
// store, VS Code chat response streams, etc). Those should be kept in a separate typings file
// specific to the client. Doing so makes it easy for us to:
//
// - Ensure consistency between the .NET types located in the AI Driver project and here.
// - Use this file as a starting point for other TypeScript clients of the AI Driver service.
//
// Warning: make sure to use camelCase for the keys of properties. The AI Driver service will ignore
// properties that are not camelCase. For example: "prop" is ok. "Prop" will be ignored.

import type * as vscode from 'vscode';

// #region Local Plugins Manifests

/**
 * The information that defines a local plugin.
 */
export type LocalPluginManifest = {
    /**
     * The ID of the extension that contains the plugin.
     */
    extensionId: string;

    /**
     * The name of the extension that contains the plugin.
     */
    extensionDisplayName: string;

    /**
     * The name of the plugin.
     */
    name: string;

    /**
     * The version of the plugin.
     */
    version: string;

    /**
     * The functions that the plugin contains.
    */
    functions: LocalPluginFunction[];

    /**
     * The topic scopes that are applicable to the current message in the conversation.
     *
     * Only valid for plugin manifests stored on the server! Exists here only for reference.
     */
    applicableTopicScopes?: (never & TopicScope[]);

    /**
     * Specifies whether we should suggest to install the extension associated with this plugin with if
     * the client does not have it installed. Defaults to `false`.
     *
     * Only valid for plugin manifests stored on the server! Exists here only for reference.
     */
    suggestInstallIfMissing?: (never & boolean);
};

/**
 * The information that defines a function within a local plugin.
 */
export type LocalPluginFunction = {
    name: string;
    parameters: LocalPluginFunctionParameter[];
    returnParameter: LocalPluginFunctionReturnParameter | null;

    /**
     * Whether the function will handle responding to the user. If this is `true`, the connection
     * to the AI Driver service should be terminated by the client before the function is invoked.
     *
     * During invocation, the function can respond to the user using whatever mechanism the client
     * provides. See typings for the client on how to respond directly to the user.
     */
    willHandleUserResponse?: boolean;

    /**
     * A description of the plugin.
     *
     * Only valid for plugin manifests stored on the server! Exists here only for reference.
     */
    description?: (never & string);
};

/**
 * A description of a parameter of a local plugin function.
 */
export type LocalPluginFunctionParameter = {
    name: string;
    type: "string" | "number" | "boolean" | "object";
    required: boolean;

    /**
     * A description of the parameter.
     *
     * Only valid for plugin manifests stored on the server! Exists here only for reference.
     */
    description?: (never & string);
};

/**
 * The description of the return parameter of a local plugin function.
 */
export type LocalPluginFunctionReturnParameter = {
    type: "string" | "number" | "boolean" | "object";

    /**
     * A description of the return parameter.
     *
     * Only valid for plugin manifests stored on the server! Exists here only for reference.
     */
    description?: (never & string);
};

// #endregion

// #region Local Plugins Function Requests

/**
 * A request from the AI Driver service to invoke a local plugin function.
 */
export type LocalPluginFunctionRequest = {
    pluginName: string;
    functionName: string;

    /**
     * The parameters to pass to the function.
     *
     * Local plugin implementations in a client may be given additional/transformed parameters.
     * See typings for the client for more information.
     */
    parameters?: { [key: string]: unknown }
}

/**
 * Acceptable types for responses to a {@link LocalPluginFunctionRequest}.
 *
 * Depending on the client, local plugin functions may be able to return other types as well.
 * See typings for the client for more information.
 *
 * ❗If the local plugin function has {@link LocalPluginFunction.willHandleUserResponse} set
 *  to `true`, then the client should have terminated the connection to the AI Driver before the function
 * is invoked. Check typings for the client for more information on how to respond directly to the user.
 */
export type LocalPluginFunctionResponse = object | boolean | number | string;

// #endregion

// #region ChatRequests

/**
 * A local developer tool that exists on the client machine.
 */
export type DevTool = {
    name: string;
    description?: string;
};

/**
 * Scopes representing various Azure related topics/tasks/information which allow a chat request
 * to more accurately describe what the user is asking about.
 *
 * - `learn`: Applies when the user is asking about general Azure concepts, not necessarily related
 * to any actual Azure resource. Plugins applicable to this topic are likely going to be
 * plugins that help look up and provide information about Azure concepts.
 *
 * - `resources`: Applies when the user is asking about their actual Azure resources. Plugins applicable
 * to this topic are likely going to be plugins that help look up and provide information
 * about the user's Azure resources.
 *
 * - `costManagement`: Applies when the user is asking about costs of their existing Azure resources. Plugins applicable
 * to this topic are likely going to be plugins that can collect information about the user's billing context
 * and use Cost Management APIs to provide costing information of the user's Azure resources.
 * - `onlineExperimentation`: Applies when the user is asking about Azure online experimentation or A/B testing or split testing.
 *  Plugins applicable to this topic are likely going to be plugins that can help user to answer questions about end-to-end online A/B experimentation,
 * from designing, implementing, to analyzing A/B experiments, particularly within the Azure ecosystem.
 */
export type TopicScope = "learn" | "resources" | "diagnostics" | "costManagement" | "onlineExperimentation";

/**
 * Additional settings that can be provided to the AI Driver service to customize the persona
 * of the agent.
 */
export type PersonaSettings = {
    /**
     * The name of the persona to use. If not provided, the default persona will be used.
     *
     * Since this file is in the VS Code Extension, the only persona that can be
     * used is "Visual Studio Code".
     */
    clientName: "Visual Studio Code";

    /**
     * The human-friendly name of the operating system of the client machine
     */
    operatingSystem: "Windows" | "MacOS" | "Linux";

    /**
     * Any local developer tools that are available on the client machine.
     */
    devTools: DevTool[];

    /**
     * The topic scopes that are applicable to the current message in the conversation.
     *
     * If no topic scope should be applied, send either `undefined` or an empty array.
     */
    topicScopes?: TopicScope[];
};

export type ChatRequestMessage = {
    role: "system" | "user" | "assistant" | "tool";
    content: string;
};

export type PluginsMetadata = { [pluginName: string]: unknown };

/**
 * VS Code settings that can be customized by the user.
 */
export type UserSettings = {
    /**
     * The type of query to send to the Microsoft Learn service.
     */
    msLearnQueryType?: "vector" | "hybrid";
    /**
     * Setting to determine whether to enable AI Platform plugin or not.
     */
    deployModel?: boolean;
};

/**
 * A request to the AI Driver service to generate a response to a user message in the context
 * of a conversation.
 */
export type ChatRequest = {
    messages: ChatRequestMessage[];
    localPluginManifests: LocalPluginManifest[];
    personaSettings?: PersonaSettings;
    selectedSubscriptionIds?: string[];
    pluginsMetadata?: PluginsMetadata;
    logLevelToSendToClient?: LogLevel;
    vsCodeTelemetryLevel?: string;
    chatSessionId?: string;
    requestId?: string;
    giveSamplePrompts?: boolean;
    userSettings?: UserSettings;
};

// #endregion

// #region ChatResponses

export type LogLevel = "trace" | "debug" | "information" | "warning" | "error" | "critical";

export type LogChatResponsePartType = "log";
export type LogChatResponsePart = {
    type: LogChatResponsePartType;
    /**
     * A string to log to a debug log output view or similar
     */
    content: string;

    /** The log level of the message. */
    logLevel: LogLevel;
};

export type SimpleChatResponsePartType = "markdown" | "progress" | "reference";
export type SimpleChatResponsePart = {
    type: SimpleChatResponsePartType;
    /**
     * The content of the part. Contents depends on the `type` of the part:
     * - `markdown`: A markdown string to display as output
     * - `progress`: A markdown string to display as a progress message
     * - `reference`: A URI to display as a reference
     */
    content: string;
};

export type TrustedMarkdownChatResponsePartType = "trustedMarkdown";
export type TrustedMarkdownChatResponsePart = {
    type: TrustedMarkdownChatResponsePartType;
    /**
     * A trusted Markdown string to display as output
     */
    content: string;
    commands: CommandPart[];
};

export type ButtonChatResponsePartType = "button";
export type ButtonChatResponsePart = {
    type: ButtonChatResponsePartType;
    /**
     * The title of the button.
     */
    content: string;
    /**
     * The command to run when the button is clicked.
     */
    command: CommandPart;
};

type CommandPart = Omit<vscode.Command, "title">;

export type TextReferenceChatResponsePartType = "textReference";
export type TextReferenceChatResponsePart = {
    type: TextReferenceChatResponsePartType;
    /**
     * The text content to be displayed when the reference is accessed.
     */
    content: string;
    textReferenceData: {
        /**
         * The display label for the reference.
         */
        label: string;
        /**
         * A file extension for the reference. Should start with a dot, e.g. ".md".
         */
        extension?: string;
    };
};

export type ErrorChatResponsePartType = "error";
export type ErrorChatResponsePart = {
    type: ErrorChatResponsePartType;
    /**
     * A markdown string to display as error output
     */
    content: string;
    /**
     * Whether to partially blur the response
     */
    responseIsFiltered?: boolean;
};

export type FollowUpChatResponsePartType = "followUp";
export type FollowUpChatResponsePart = {
    type: FollowUpChatResponsePartType;
    /**
     * A string to display as a follow-up prompt.
     */
    content: string;
};

export type TipMessageResponsePartType = "tipMessage";
/**
 * A tip for the user. This is neither a direct response to the user's query, nor a suggested prompt. It is a
 * suggestion on how to better chat with the assistant/use the chat interface/etc.
 */
export type TipMessageResponsePart = {
    type: TipMessageResponsePartType;

    /**
     * The category of the tip. The client can use this to de-duplicate tip messages if desired.
    */
    category: string;

    /**
     * The tip message to display. Should be markdown, may contain command links, and should be considered trusted.
     */
    content: string;

    /**
     * If the content contains commands, then the commands.
     */
    readonly commands: CommandPart[];
};

export type DisplayableChatResponsePart = SimpleChatResponsePart | TrustedMarkdownChatResponsePart | ButtonChatResponsePart | TextReferenceChatResponsePart | ErrorChatResponsePart | FollowUpChatResponsePart | TipMessageResponsePart;

export type PluginInvocationMetadata = { pluginName: string; functionName: string; parameterNames: string[] };

export type MetadataChatResponsePartType = "metadata";
export type MetadataChatResponsePart = {
    type: MetadataChatResponsePartType;
    content: "";
    metadata: {
        /**
         * The number of tokens in the chat history of the request.
         *
         * This includes the AI Driver's system prompt and the chat request messages.
         */
        historyTokenCount: number;

        /**
         * The number of tokens in the output.
         */
        outputTokenCount: number;

        /**
         * A list of plugin invocations made by the AI Driver.
         */
        pluginInvocations: PluginInvocationMetadata[];

        /**
         * The name of the model used by AI Driver's orchestrator.
         */
        orchestratorModelName: string;

        /**
         * Metadata set by plugins during the chat request. This metadata should
         * be persisted in the chat history, and sent back to the AI Driver in the
         * next chat request.
         */
        pluginsMetadata: PluginsMetadata;

        /**
         * The number of times the AI Driver had to retry getting a response from CAPI.
         */
        retryCount: number;
    }
};

export type ChatResponsePart = DisplayableChatResponsePart | LogChatResponsePart | MetadataChatResponsePart;

// #endregion
