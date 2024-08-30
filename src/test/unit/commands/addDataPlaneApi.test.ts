// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import { ConnectDataPlaneApi } from '../../../commands/addDataPlaneApis';
import { TelemetryClient } from "../../../common/telemetryClient";
import { DataPlaneApiFromType } from "../../../common/telemetryEvent";
describe('getDataPlaneApis test happy path', () => {
    let sandbox = null as any;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        sinon.restore();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("sendDataPlaneApiTelemetry happy path", async () => {
        let sendEventStub = sandbox.stub(TelemetryClient, "sendEvent").returns();
        ConnectDataPlaneApi.sendDataPlaneApiTelemetry("fakeRuntimeUrl", "fakeClientId", "fakeTenantId", DataPlaneApiFromType.dataPlaneApiAddFromInput);
        sandbox.assert.calledOnce(sendEventStub);
        assert.equal(sendEventStub.getCall(0).args[0], "dataPlane.addApiInstance");
        assert.equal(sendEventStub.getCall(0).args[1].dataPlaneRuntimeUrl, "fakeRuntimeUrl");
        assert.equal(sendEventStub.getCall(0).args[1].dataPlaneTenantId, "fakeTenantId");
        assert.equal(sendEventStub.getCall(0).args[1].dataPlaneClientId, "fakeClientId");
        assert.equal(sendEventStub.getCall(0).args[1].dataPlaneApiAddSource, "dataPlaneApiAddFromInput");
    });
});
