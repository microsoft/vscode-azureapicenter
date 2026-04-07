// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from 'assert';
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ConnectDataPlaneApi } from '../../../commands/addDataPlaneApis';
import { handleUri } from "../../../commands/handleUri";
import * as installSkillModule from "../../../commands/installSkill";

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

    it('handleUri routes /install to installSkill', async () => {
        const fakeUrl = 'vscode://apidev.azure-api-center/install?sourceUrl=https%3A%2F%2Fgithub.com%2Fowner%2Frepo%2Ftree%2Fmain%2Fskills%2Fmine&name=my-skill';
        const url = vscode.Uri.parse(fakeUrl);
        const installSkillStub = sandbox.stub(installSkillModule, 'installSkill').resolves();
        // Ensure data plane path is NOT called
        const stubTelemetryEvent = sandbox.stub(ConnectDataPlaneApi, "sendDataPlaneApiTelemetry").returns();

        await handleUri(url);

        sandbox.assert.calledOnce(installSkillStub);
        assert.equal(installSkillStub.getCall(0).args[0], 'https://github.com/owner/repo/tree/main/skills/mine');
        assert.equal(installSkillStub.getCall(0).args[1], 'my-skill');
        sandbox.assert.notCalled(stubTelemetryEvent);
    });
});

