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
    it("get apis center getAPiCenterApiVersions success", async () => {
        sandbox.stub(ServiceClient.prototype, "sendRequest").resolves({ status: 200, parsedBody: { value: "fakeApiVersions", nextLink: "fakeNextLink" } } as HttpOperationResponse);
        const serverClient = new ApiCenterDataPlaneService(subscriptionContext);

        const response = await serverClient.getAPiCenterApiVersions("fakeApiName");
        assert.strictEqual(response.value, 'fakeApiVersions');
    });
    it("get apis center getApiCenterApiDefinitions success", async () => {
        sandbox.stub(ServiceClient.prototype, "sendRequest").resolves({ status: 200, parsedBody: { value: "fakeApiDefinitions", nextLink: "fakeNextLink" } } as HttpOperationResponse);
        const serverClient = new ApiCenterDataPlaneService(subscriptionContext);

        const response = await serverClient.getApiCenterApiDefinitions("fakeApiName", "fakeApiVersion");
        assert.strictEqual(response.value, 'fakeApiDefinitions');
    });
    it("get apis center exportSpecification success", async () => {
        sandbox.stub(ServiceClient.prototype, "sendRequest").resolves({ status: 200, parsedBody: { format: "inline", value: "fakeSpecification" } } as HttpOperationResponse);
        const serverClient = new ApiCenterDataPlaneService(subscriptionContext);

        const response = await serverClient.exportSpecification("fakeApiName", "fakeApiVersion", "fakeApiCenterApiVersionDefinitionName");
        assert.strictEqual(response.format, 'inline');
        assert.strictEqual(response.value, 'fakeSpecification');
    });
    it("listApiEnvrionments success", async () => {
        const mockResponse = {
            status: 200,
            parsedBody: {
                value: [
                    {
                        name: "envName1",
                        title: "envTitle1",
                        kind: "kind1",
                        server: {
                            type: "Azure API Management",
                            managementPortalUris: ["uri1"]
                        }
                    }
                ],
                nextLink: "fakeNextLink"
            }
        } as HttpOperationResponse;
        sandbox.stub(ServiceClient.prototype, "sendRequest").resolves(mockResponse);
        const serverClient = new ApiCenterDataPlaneService(subscriptionContext);
        const response = await serverClient.listApiEnvrionments();
        assert.strictEqual(response.value.length, 1);
        assert.strictEqual(response.value[0].name, "envName1");
        assert.strictEqual(response.nextLink, "fakeNextLink");
    });
    it("listApiEnvrionments failed", async () => {
        sandbox.stub(ServiceClient.prototype, "sendRequest").resolves({ status: 500, bodyAsText: "error" } as HttpOperationResponse);
        const serverClient = new ApiCenterDataPlaneService(subscriptionContext);
        const response = await serverClient.listApiEnvrionments();
        assert.equal(response, undefined);
    });
    it("listApiDeployments success", async () => {
        const mockResponse = {
            status: 200,
            parsedBody: {
                value: [
                    {
                        name: "deploy1",
                        title: "Deployment 1",
                        environment: "env1",
                        server: {
                            runtimeUri: ["http://runtime1"]
                        },
                        recommended: true
                    }
                ],
                nextLink: "fakeNextLink"
            }
        } as HttpOperationResponse;
        sandbox.stub(ServiceClient.prototype, "sendRequest").resolves(mockResponse);
        const serverClient = new ApiCenterDataPlaneService(subscriptionContext);
        const response = await serverClient.listApiDeployments("fakeApiName");
        assert.strictEqual(response.value.length, 1);
        assert.strictEqual(response.value[0].name, "deploy1");
        assert.strictEqual(response.nextLink, "fakeNextLink");
    });
    it("listApiDeployments failed", async () => {
        sandbox.stub(ServiceClient.prototype, "sendRequest").resolves({ status: 500, bodyAsText: "error" } as HttpOperationResponse);
        const serverClient = new ApiCenterDataPlaneService(subscriptionContext);
        const response = await serverClient.listApiDeployments("fakeApiName");
        assert.equal(response, undefined);
    });
});
