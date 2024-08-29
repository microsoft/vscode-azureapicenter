// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AzExtTreeItem, ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
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
            subscriptionId: "",
            subscriptionPath: "fakePath",
        };
        const mockItem = new MockAzExtTreeItem(mockSubscriptionContext as ISubscriptionContext);

        const properties: { [key: string]: string; } = {};

        TelemetryUtils.setAzureResourcesInfo(properties, mockItem);

        assert.strictEqual(properties["subscriptionPath"], "fakePath");
        assert.strictEqual(properties["resourceName"], "mockLabel");
    });
});
