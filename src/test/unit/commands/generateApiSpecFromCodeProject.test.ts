// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { generateApiSpecFromCodeProject } from '../../../commands/generateApiSpecFromCodeProject';
import generateApiSpecFromCodeProjectPrompt from "../../../prompts/generateApiSpecFromCodeProject";

describe('generateApiSpecFromCodeProject Tests', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should call executeCommand', async () => {
        const context = {} as any;
        const executeCommandStub = sandbox.stub(vscode.commands, 'executeCommand');

        await generateApiSpecFromCodeProject(context);

        const expectedQuery = generateApiSpecFromCodeProjectPrompt();
        sinon.assert.calledWith(executeCommandStub, 'workbench.action.chat.open', {
            query: expectedQuery
        });
    });
});
