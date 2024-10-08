// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { HttpOperationResponse, ServiceClient } from "@azure/ms-rest-js";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from "sinon";
import { ApiCenterDataPlaneService } from "../../../../azure/ApiCenter/ApiCenterDataPlaneAPIs";
describe("Api Center Data Plane Apis Server", () => {
    let sandbox: sinon.SinonSandbox;
    let subscriptionContext: ISubscriptionContext;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        subscriptionContext = {
            credentials: {
                getToken: sandbox.stub().resolves({ token: 'fake-token' })
            }
        } as unknown as ISubscriptionContext;
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("get apis center apis succeeded", async () => {
        const mockResponse = {
            status: 200,
            parsedBody: { value: "fakeApis", nextLink: "fakeNextLink" },
        } as HttpOperationResponse;
        sandbox.stub(ServiceClient.prototype, "sendRequest").resolves(mockResponse);

        const serverClient = new ApiCenterDataPlaneService(subscriptionContext);

        const response = await serverClient.getApiCenterApis();

        assert.strictEqual(response.value, 'fakeApis');
    });
    it("get apis center apis failed", async () => {
        sandbox.stub(ServiceClient.prototype, "sendRequest").resolves({ status: 500, bodyAsText: "error" } as HttpOperationResponse);

        const serverClient = new ApiCenterDataPlaneService(subscriptionContext);

        let response = await serverClient.getApiCenterApis();
        assert.equal(response, undefined);
    });
});
