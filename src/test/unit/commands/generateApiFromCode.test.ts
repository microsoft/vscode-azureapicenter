// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from 'fs';
import * as sinon from "sinon";
import * as vscode from 'vscode';
import { GenerateApiFromCode } from "../../../commands/generateApiFromCode";
import { GeneralUtils } from "../../../utils/generalUtils";

const SuccessfulLlmResponse = ["ok"];
const UnsuccessfulLlmResponse = ["Sorry, ", "I ", "can't", " assist!"];

suite("generateApiFromCode", () => {
    let sandbox: sinon.SinonSandbox;
    suiteSetup(() => {
        sandbox = sinon.createSandbox();
    });

    setup(() => {
        sandbox.stub(GeneralUtils, "sleep").resolves();
        const fakeEditor = {
            document: {
                languageId: 'javascript',
                uri: { fsPath: 'path/to/file.js' }
            }
        };
        sandbox.stub(vscode.window, 'activeTextEditor').value(fakeEditor);
        sandbox.stub(fs.promises, 'readFile').resolves('function test() {}');
    });

    teardown(() => {
        sandbox.restore();
    });

    test("fail to generate API", async () => {
        let sendRequestStub = sandbox.stub();

        for (let i = 0; i < 5; i++) {
            sendRequestStub.onCall(i).resolves({
                text: createMockAsyncIterable(UnsuccessfulLlmResponse)
            });
        }

        createMockForSelectChatModels(sandbox, sendRequestStub);

        await GenerateApiFromCode.generateApiFromCode({} as IActionContext);

        sinon.assert.callCount(sendRequestStub, 5);
    });

    test("generate API with 2 retries", async () => {
        let sendRequestStub = sandbox.stub();

        sendRequestStub.onCall(0).resolves({
            text: createMockAsyncIterable(UnsuccessfulLlmResponse)
        });
        sendRequestStub.onCall(1).resolves({
            text: createMockAsyncIterable(SuccessfulLlmResponse)
        });

        createMockForSelectChatModels(sandbox, sendRequestStub);

        await GenerateApiFromCode.generateApiFromCode({} as IActionContext);

        sinon.assert.callCount(sendRequestStub, 2);
    });

    test("generate API without retry", async () => {
        let sendRequestStub = sandbox.stub();

        sendRequestStub.onCall(0).resolves({
            text: createMockAsyncIterable(SuccessfulLlmResponse)
        });

        createMockForSelectChatModels(sandbox, sendRequestStub);

        await GenerateApiFromCode.generateApiFromCode({} as IActionContext);

        sinon.assert.callCount(sendRequestStub, 1);
    });
});

function createMockAsyncIterable(strings: string[]): AsyncIterableIterator<string> {
    let index = 0;
    return {
        async next() {
            if (index < strings.length) {
                return Promise.resolve({ value: strings[index++], done: false });
            } else {
                return Promise.resolve({ value: null, done: true });
            }
        },
        [Symbol.asyncIterator]() {
            return this;
        }
    };
}

function createMockForSelectChatModels(sandbox: sinon.SinonSandbox, sendRequestStub: sinon.SinonStub) {
    sandbox.stub(vscode.lm, "selectChatModels").resolves([{
        sendRequest: sendRequestStub,
        name: "",
        id: "",
        vendor: "",
        family: "",
        version: "",
        maxInputTokens: 0,
        countTokens: async function (text: string | vscode.LanguageModelChatMessage, token?: vscode.CancellationToken): Promise<number> {
            throw new Error("Function not implemented.");
        }
    }]);
}
