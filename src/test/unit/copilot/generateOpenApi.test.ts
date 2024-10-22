// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import axios from 'axios';
import * as fs from 'fs';
import * as sinon from "sinon";
import * as vscode from 'vscode';
import { handleGenerateOpenApi } from '../../../copilot/generateOpenApi';
import { AgentRequest } from '../../../types/AzureAgent';
import assert = require('assert');

const spectralDefaultRuleDescription = 'Operation must have at least one "2xx" or "3xx" response.';
const endPromptWithoutRules = 'make sure the OpenAPI spec meet with below rules:\n';

describe('handleGenerateOpenApi', () => {
    let agentRequest: AgentRequest;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        agentRequest = {
            userPrompt: 'Generate OpenAPI spec for my API',
            responseStream: {
                progress: sandbox.stub()
            }
        } as unknown as AgentRequest;
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should return response with default rules if no ruleset file is configured', async () => {
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().returns(undefined)
        } as unknown as vscode.WorkspaceConfiguration);

        const result: any = await handleGenerateOpenApi(agentRequest);

        assert.ok((result.responseForLanguageModel.result as string).includes('Please be professional'));
        assert.ok((result.responseForLanguageModel.result as string).includes(spectralDefaultRuleDescription));
        assert.strictEqual(result.chatResponseParts.length, 6);
    });

    it('should return response with custom rules if ruleset file is configured', async () => {
        const rulesetFileContent = `
        extends:
          - spectral:oas
          - spectral:oas123
        rules:
          operation-description:
            description: "Operation must have a description123"
            formats: ["oas3"]
          operation-description-2:
            description: "Operation must have a description456"
            formats: ["oas2"]
        `;
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().returns('path/to/ruleset.yaml')
        } as unknown as vscode.WorkspaceConfiguration);
        sandbox.stub(fs.promises, 'readFile').resolves(rulesetFileContent);

        const result: any = await handleGenerateOpenApi(agentRequest);

        assert.ok((result.responseForLanguageModel.result as string).includes(spectralDefaultRuleDescription));
        assert.ok((result.responseForLanguageModel.result as string).includes('Operation must have a description123'));
        assert.ok(!(result.responseForLanguageModel.result as string).includes('Operation must have a description456'));
        assert.strictEqual(result.chatResponseParts.length, 4);
    });

    it('should handle errors when reading ruleset file', async () => {
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().returns('path/to/ruleset.yaml')
        } as unknown as vscode.WorkspaceConfiguration);
        sandbox.stub(fs.promises, 'readFile').rejects(new Error('File not found'));

        const result: any = await handleGenerateOpenApi(agentRequest);

        assert.ok((result.responseForLanguageModel.result as string).endsWith(endPromptWithoutRules));
    });

    it('should handle ruleset file from URL', async () => {
        const rulesetFileContent = JSON.stringify({
            extends: "spectral:oas",
            rules: {
                "operation-description": {
                    description: "Operation must have a description123",
                    formats: ["oas3"]
                }
            }
        }, null, 2);
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().returns('https://example.com/ruleset.yaml')
        } as unknown as vscode.WorkspaceConfiguration);
        sandbox.stub(axios, 'get').resolves({ data: rulesetFileContent });

        const result: any = await handleGenerateOpenApi(agentRequest);

        assert.ok((result.responseForLanguageModel.result as string).includes(spectralDefaultRuleDescription));
        assert.ok((result.responseForLanguageModel.result as string).includes('Operation must have a description123'));
    });

    it('should handle invalid ruleset file content', async () => {
        sandbox.stub(vscode.workspace, 'getConfiguration').returns({
            get: sandbox.stub().returns('path/to/ruleset.yaml')
        } as unknown as vscode.WorkspaceConfiguration);
        sandbox.stub(fs.promises, 'readFile').resolves('invalid content');

        const result: any = await handleGenerateOpenApi(agentRequest);

        assert.ok((result.responseForLanguageModel.result as string).endsWith(endPromptWithoutRules));
    });
});
