// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import { AzureApiCenterService } from "../../../commands/createApiCenterService";

describe("createApiCenterService", () => {
    let sandbox: sinon.SinonSandbox;
    let subscriptionContext: any;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("validateResponse success", () => {
        let response = { status: 200, message: "success" };
        let result = AzureApiCenterService.validateResponse(response);

    });
    it("validaResourceGroup success", () => {
        let response = 204;
        let result = AzureApiCenterService.validaResourceGroup(response);
        assert.strictEqual(result, false);
    });
});
