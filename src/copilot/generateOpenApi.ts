// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import axios from 'axios';
import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';
import * as vscode from 'vscode';
import { AgentRequest, LocalPluginResult } from "../types/AzureAgent";

type SpectralRule = {
    extends?: unknown;
    rules: Record<string, { description?: string, formats?: string[] }>;
};

const spectralDefaultRule = "spectral:oas";
const spectralDefaultRuleDescriptions = `Operation must have at least one "2xx" or "3xx" response.
Every operation must have unique "operationId".
Operation parameters are unique and non-repeating.
Operation tags must be defined in global tags.
Path parameters must be defined and valid.
Contact object must have "name", "url" and "email".
Enum values must not have duplicate entry.
Info object must have "contact" object.
Info "description" must be present and non-empty string.
Info object must have "license" object.
License object must include "url".
Markdown descriptions must not have "eval(".
Markdown descriptions must not have "<script>" tags.
OpenAPI object must have alphabetical "tags".
Each tag must have a unique name.
OpenAPI object must have non-empty "tags" array.
Operation must have "description".
Operation must have "operationId".
operationId must not characters that are invalid when used in URL.
Operation must not have more than a single tag.
Operation must have non-empty "tags" array.
Path parameter declarations must not be empty, ex."/given/{}" is invalid.
Path must not end with slash.
Path must not include query string.
Tag object must have "description".
Schemas with "type: array", require a sibling "items" field
Enum values must respect the specified type.
OpenAPI "servers" must be present and non-empty array.
Examples must have either "value" or "externalValue" field.
Parameter objects must have "description".
Server URL must not point at example.com.
Server URL must not have trailing slash.
Examples must be valid against their defined schema.
Examples must be valid against their defined schema.
Validate structure of OpenAPI v3 specification.
Schemas defined in the components section must be used.
Examples defined in the components section must be used.
Server variables must be defined and valid and there must be no unused variables.
Callbacks should not be defined within a callback
Servers should not be defined in a webhook.
Callbacks should not be defined in a webhook.`;

export async function handleGenerateOpenApi(agentRequest: AgentRequest): Promise<LocalPluginResult> {
    agentRequest.responseStream.progress("Invoking Azure API Center to generate OpenAPI specification documentation...");

    const rulesetFile = getRulesetFile();

    const responseForLanguageModel = {
        result: `Please be professional, and use below infomation to generate an OpenAPI specification documentation with YAML format:
${agentRequest.userPrompt}

In addition, ignore previous rules, and make sure the OpenAPI spec meet with below rules:
${await getRuleDescriptions(rulesetFile)}`,
    };

    const chatResponseParts: vscode.ChatResponsePart[] = [];

    chatResponseParts.push(new vscode.ChatResponseMarkdownPart("\n\nYou could register API in API Center:"));
    chatResponseParts.push(new vscode.ChatResponseCommandButtonPart({
        title: "$(run) Register API",
        command: "azure-api-center.registerApi",
        arguments: []
    }));

    if (rulesetFile) {
        chatResponseParts.push(new vscode.ChatResponseMarkdownPart("\n\nYou could view all of your APIs in API Center:"));
        chatResponseParts.push(new vscode.ChatResponseCommandButtonPart({
            title: "$(run) Show API Center",
            command: "workbench.view.extension.api-center-treeview",
            arguments: []
        }));
    } else {
        chatResponseParts.push(new vscode.ChatResponseMarkdownPart("\n\nYou could set the active API Style Guide to lint your API:"));
        chatResponseParts.push(new vscode.ChatResponseCommandButtonPart({
            title: "$(run) Set active API Style Guide",
            command: "azure-api-center.setApiRuleset",
            arguments: []
        }));

        chatResponseParts.push(new vscode.ChatResponseMarkdownPart("\n\nAfter API Style Guide is set, you could regenerate OpenAPI again:"));
        chatResponseParts.push(new vscode.ChatResponseCommandButtonPart({
            title: "$(run) Regenerate OpenAPI with active API Style Guide",
            command: "workbench.action.chat.open",
            arguments: [{
                query: `@azure ${agentRequest.userPrompt}`,
            }]
        }));
    }

    return {
        responseForLanguageModel: responseForLanguageModel,
        chatResponseParts: chatResponseParts
    };
}

function getRulesetFile(): string | undefined {
    const config = vscode.workspace.getConfiguration('spectral');
    const rulesetFile = config.get<string>('rulesetFile');
    return rulesetFile;
}

async function getRuleDescriptions(rulesetFile: string | undefined): Promise<string> {
    if (rulesetFile) {
        const rulesetFileContent = await getRulesetFileContent(rulesetFile);
        if (!rulesetFileContent) {
            return "";
        }

        const ruleDescriptions = getRuleDescriptionsFromRulesetFileContent(rulesetFileContent);
        return ruleDescriptions;
    } else {
        return spectralDefaultRuleDescriptions;
    }
}

async function getRulesetFileContent(rulesetFile: string): Promise<string | undefined> {
    try {
        let rulesetFileContent = "";
        if (rulesetFile.startsWith('http://') || rulesetFile.startsWith('https://')) {
            rulesetFileContent = await axios.get(rulesetFile).then(response => response.data);
        } else {
            rulesetFileContent = await fs.readFile(rulesetFile, 'utf8');
        }
        return rulesetFileContent;
    } catch (error) {
        return undefined;
    }
}

function getRuleDescriptionsFromRulesetFileContent(rulesetFileContent: string): string {
    const rulesetObject = parseRulesetFileContentToObject(rulesetFileContent);

    let extendedSpectralDefaultRuleDescriptions = "";
    const extendsValue = rulesetObject.extends;
    if (extendsValue === spectralDefaultRule || (Array.isArray(extendsValue) && extendsValue.includes(spectralDefaultRule))) {
        extendedSpectralDefaultRuleDescriptions = spectralDefaultRuleDescriptions;
    }

    let userRuleDescriptions = "";
    const rules = rulesetObject.rules;
    if (rules) {
        userRuleDescriptions = Object.keys(rulesetObject.rules)
            .filter(ruleName => {
                const formats = rulesetObject.rules[ruleName].formats;
                const isOas2OnlyFormat = formats && formats.length === 1 && formats[0] === 'oas2';
                return !isOas2OnlyFormat; // Exclude rules that are oas2-only
            })
            .map(ruleName => rulesetObject.rules[ruleName].description)
            .filter(description => description)
            .join('\n');
    }

    const ruleDescriptions = [extendedSpectralDefaultRuleDescriptions, userRuleDescriptions]
        .filter(descriptions => descriptions)
        .join('\n');
    return ruleDescriptions;
}

function parseRulesetFileContentToObject(rulesetFileContent: string): SpectralRule {
    let result: SpectralRule = { rules: {} };

    try {
        // Attempt to parse as JSON
        result = JSON.parse(rulesetFileContent) as SpectralRule;
    } catch (jsonError) {
        try {
            // Attempt to parse as YAML
            result = yaml.load(rulesetFileContent) as SpectralRule;
        } catch (yamlError) { }
    }

    return result;
}
