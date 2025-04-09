// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
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
});
