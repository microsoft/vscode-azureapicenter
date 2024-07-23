// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { AzureAccount } from "../../../../azure/azureLogin/azureAccount";

describe("Azure Account test case", () => {
    let sandbox = null as any;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("getSelectedTenant happy path", async () => {
        let spyConf = sandbox.stub(vscode.workspace, "getConfiguration").returns({
            get: () => {
                return "test";
            },
        } as any);
        let res = await AzureAccount.getSelectedTenant();
        sandbox.assert.calledOnce(spyConf);
        assert.strictEqual(res, "test");
    });
})
