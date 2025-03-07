// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import axios from 'axios';
import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';
import * as vscode from 'vscode';
import createContextWithTuple from '../common/promptContext';
import generateApiSpecFromPrompt, { spectralDefaultRuleDescriptions } from "../prompts/generateApiSpecFromPrompt";
import { AgentRequest, LocalPluginResult } from "../types/AzureAgent";
import { UiStrings } from '../uiStrings';

export namespace GenerateOpenApi {
    type SpectralRule = {
        extends?: unknown;
        rules: Record<string, { description?: string, formats?: string[] }>;
    };

    const spectralDefaultRule = "spectral:oas";

    export async function handleGenerateOpenApi(agentRequest: AgentRequest): Promise<LocalPluginResult> {
        agentRequest.responseStream.progress(UiStrings.GenerateOpenApiProgress);

        const rulesetFile = getRulesetFile();
        const userPrompt = agentRequest.userPrompt;
        const ruleContent = await getRuleDescriptions(rulesetFile);

        const responseForLanguageModel = {
            result: generateApiSpecFromPrompt(createContextWithTuple({ userPrompt, ruleContent }))
        };

        const chatResponseParts: vscode.ChatResponsePart[] = [];

        chatResponseParts.push(new vscode.ChatResponseMarkdownPart(UiStrings.GenerateOpenApiRegisterApiDesc));
        chatResponseParts.push(new vscode.ChatResponseCommandButtonPart({
            title: UiStrings.GenerateOpenApiRegisterApiButton,
            command: "azure-api-center.registerApi",
            arguments: []
        }));

        if (rulesetFile) {
            chatResponseParts.push(new vscode.ChatResponseMarkdownPart(UiStrings.GenerateOpenApiViewApiDesc));
            chatResponseParts.push(new vscode.ChatResponseCommandButtonPart({
                title: UiStrings.GenerateOpenApiViewApiButton,
                command: "workbench.view.extension.api-center-treeview",
                arguments: []
            }));
        } else {
            chatResponseParts.push(new vscode.ChatResponseMarkdownPart(UiStrings.GenerateOpenApiSetRuleDesc));
            chatResponseParts.push(new vscode.ChatResponseCommandButtonPart({
                title: UiStrings.GenerateOpenApiSetRuleButton,
                command: "azure-api-center.setApiRuleset",
                arguments: []
            }));

            chatResponseParts.push(new vscode.ChatResponseMarkdownPart(UiStrings.GenerateOpenApiRegenerateDesc));
            chatResponseParts.push(new vscode.ChatResponseCommandButtonPart({
                title: UiStrings.GenerateOpenApiRegenerateButton,
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

    export function getRulesetFile(): string | undefined {
        const config = vscode.workspace.getConfiguration('spectral');
        const rulesetFile = config.get<string>('rulesetFile');
        return rulesetFile;
    }

    export async function getRuleDescriptions(rulesetFile: string | undefined): Promise<string> {
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
                rulesetFileContent = (await axios.get(rulesetFile)).data;
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
}
