// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AzExtTreeItem, ISubscriptionContext, UserCancelledError, parseError } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from "sinon";
import { TelemetryClient } from "../../../common/telemetryClient";
import { ErrorProperties } from "../../../common/telemetryEvent";
import { TelemetryUtils } from "../../../utils/telemetryUtils";

class MockAzExtTreeItem extends AzExtTreeItem {
    public label: string;
    public contextValue: string;
    constructor(subscriptionContext: ISubscriptionContext) {
        super(undefined);
        this.label = 'mockLabel';
        this.contextValue = 'mockContext';
        this._subscription = subscriptionContext;
    }

    private _subscription: ISubscriptionContext;

    public get subscription(): ISubscriptionContext {
        return this._subscription;
    }
}

describe("telemetryUtils", () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("set Azure Resources Info", () => {
        const mockSubscriptionContext = {
            subscriptionId: "mockSubscriptionId",
        };
        const mockItem = new MockAzExtTreeItem(mockSubscriptionContext as ISubscriptionContext);

        const properties: { [key: string]: string; } = {};

        TelemetryUtils.setAzureResourcesInfo(properties, mockItem);

        assert.strictEqual(properties["subscriptionId"], "mockSubscriptionId");
        assert.strictEqual(properties["resourceName"], "mockLabel");
    });

    it("set Azure Resource dataplane info", () => {
        const mockSubscriptionContext = {
            subscriptionPath: "fakePath",
            tenantId: "fakeTenantId",
            userId: "fakeClientId",
        };
        const mockItem = new MockAzExtTreeItem(mockSubscriptionContext as ISubscriptionContext);

        const properties: { [key: string]: string; } = {};

        TelemetryUtils.setAzureResourcesInfo(properties, mockItem);

        assert.strictEqual(properties["dataPlaneRuntimeUrl"], "fakePath");
        assert.strictEqual(properties["dataPlaneTenantId"], "fakeTenantId");
        assert.strictEqual(properties["dataPlaneClientId"], "fakeClientId");
        assert.strictEqual(properties["resourceName"], "mockLabel");
    });

    describe("callWithTelemetry", () => {
        let sendEventStub: sinon.SinonStub;
        let sendErrorEventStub: sinon.SinonStub;

        beforeEach(() => {
            sendEventStub = sandbox.stub(TelemetryClient, "sendEvent");
            sendErrorEventStub = sandbox.stub(TelemetryClient, "sendErrorEvent");
        });

        it("should send start and end events on successful execution", async () => {
            const result = "success";
            const callback = async () => result;

            const actual = await TelemetryUtils.callWithTelemetry("testEvent", callback);

            assert.strictEqual(actual, result);
            sinon.assert.calledWith(sendEventStub.firstCall, "testEvent.start");
            sinon.assert.calledWith(sendEventStub.secondCall, "testEvent.end");
            sinon.assert.notCalled(sendErrorEventStub);
        });

        it("should send error event when callback throws non-user-cancelled error", async () => {
            const error = new Error("Test error");
            const callback = async () => { throw error; };

            await assert.rejects(async () => {
                await TelemetryUtils.callWithTelemetry("testEvent", callback);
            }, error);

            sinon.assert.calledWith(sendEventStub.firstCall, "testEvent.start");
            sinon.assert.calledWith(sendErrorEventStub, "testEvent.end", {
                [ErrorProperties.errorType]: parseError(error).errorType,
                [ErrorProperties.errorMessage]: error.message
            });
        });

        it("should return undefined when user cancels", async () => {
            const error = new UserCancelledError();
            const callback = async () => { throw error; };

            const result = await TelemetryUtils.callWithTelemetry("testEvent", callback);

            assert.strictEqual(result, undefined);
            sinon.assert.calledWith(sendEventStub.firstCall, "testEvent.start");
            sinon.assert.calledWith(sendErrorEventStub, "testEvent.end", {
                [ErrorProperties.errorType]: parseError(error).errorType,
                [ErrorProperties.errorMessage]: error.message
            });
        });
    });
});
