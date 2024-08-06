// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from 'assert';
import * as sinon from "sinon";
import * as vscode from "vscode";
import * as addDataPlaneApis from '../../../commands/addDataPlaneApis';
import { handleUri } from "../../../commands/handleUri";
describe('handleUri test happy path', () => {
    let sandbox = null as any;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('handleUri happy path', async () => {
        const fakeUrl = 'vscode-insiders://apidev.azure-api-center?clientId=fakeClientId&tenantId=fakeTenantId&runtimeUrl=fakeRuntimeUrl';
        const url = vscode.Uri.parse(fakeUrl);
        const stubSetAccountToExt = sandbox.stub(addDataPlaneApis, "setAccountToExt").returns();
        sandbox.stub(vscode.commands, 'executeCommand').resolves();
        await handleUri(url);
        sandbox.assert.calledOnce(stubSetAccountToExt);
        assert.equal(stubSetAccountToExt.getCall(0).args[0], 'fakeRuntimeUrl');
        assert.equal(stubSetAccountToExt.getCall(0).args[1], 'fakeClientId');
        assert.equal(stubSetAccountToExt.getCall(0).args[2], 'fakeTenantId');
    });
});
