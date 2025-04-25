// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from 'assert';
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ConnectDataPlaneApi } from '../../../commands/addDataPlaneApis';
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
        let stubTelemetryEvent = sandbox.stub(ConnectDataPlaneApi, "sendDataPlaneApiTelemetry").returns();
        let stubSetAccountToExt = sandbox.stub(ConnectDataPlaneApi, "setAccountToExt").returns(true);
        let showWindowStub = sandbox.stub(vscode.window, "showInformationMessage").resolves("OK");
        sandbox.stub(vscode.commands, 'executeCommand').resolves();
        await handleUri(url);
        sandbox.assert.calledOnce(stubSetAccountToExt);
        assert.equal(stubSetAccountToExt.getCall(0).args[0], 'fakeRuntimeUrl');
        assert.equal(stubSetAccountToExt.getCall(0).args[1], 'fakeClientId');
        assert.equal(stubSetAccountToExt.getCall(0).args[2], 'fakeTenantId');
        sandbox.assert.calledOnce(stubTelemetryEvent);
        sandbox.assert.calledOnce(showWindowStub);
        assert.equal(stubTelemetryEvent.getCall(0).args[3], 'dataPlaneApiAddFromDeepLink');
    });
});
