// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { HttpHeaders, HttpOperationResponse, ServiceClient } from "@azure/ms-rest-js";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from "sinon";
import { ApiCenterService } from "../../../../azure/ApiCenter/ApiCenterService";
import { ApiCenterRulesetImport, ApiCenterRulesetImportFormat } from "../../../../azure/ApiCenter/contracts";

describe("ApiCenterService", () => {
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
    it("importRuleset succeeded", async () => {
        const mockResponse1 = { status: 202 } as HttpOperationResponse;
        mockResponse1.headers = new HttpHeaders({ Location: "fakeLocation" });
        const mockResponse2 = {
            status: 200,
            parsedBody: { status: "Succeeded" },
        } as HttpOperationResponse;
        const sendRequestStub = sandbox.stub(ServiceClient.prototype, "sendRequest");
        sendRequestStub.onFirstCall().resolves(mockResponse1);
        sendRequestStub.onSecondCall().resolves(mockResponse2);

        const apiCenterService = new ApiCenterService(subscriptionContext, "fakeResourceGroup", "fakeServiceName");
        const importPayload: ApiCenterRulesetImport = {
            value: "fakeValue",
            format: ApiCenterRulesetImportFormat.InlineZip,
        };

        const response = await apiCenterService.importRuleset(importPayload, "fakeConfigName");

        assert.strictEqual(response.isSuccessful, true);
    });
    it("importRuleset failed on first call", async () => {
        sandbox.stub(ServiceClient.prototype, "sendRequest").resolves({ status: 500, bodyAsText: "error" } as HttpOperationResponse);

        const apiCenterService = new ApiCenterService(subscriptionContext, "fakeResourceGroup", "fakeServiceName");
        const importPayload: ApiCenterRulesetImport = {
            value: "fakeValue",
            format: ApiCenterRulesetImportFormat.InlineZip,
        };

        const response = await apiCenterService.importRuleset(importPayload, "fakeConfigName");

        assert.strictEqual(response.isSuccessful, false);
        assert.strictEqual(response.message, "error");
    });
    it("importRuleset failed on status check", async () => {
        const mockResponse1 = { status: 202 } as HttpOperationResponse;
        mockResponse1.headers = new HttpHeaders({ Location: "fakeLocation" });
        const mockResponse2 = {
            status: 202,
            parsedBody: { status: "InProgress" },
        } as HttpOperationResponse;
        const mockResponse3 = {
            status: 400,
            parsedBody: {
                status: "Failed",
                properties: {
                    comment: "error"
                }
            },
        } as HttpOperationResponse;
        const sendRequestStub = sandbox.stub(ServiceClient.prototype, "sendRequest");
        sendRequestStub.onFirstCall().resolves(mockResponse1);
        sendRequestStub.onSecondCall().resolves(mockResponse2);
        sendRequestStub.onThirdCall().resolves(mockResponse3);

        const apiCenterService = new ApiCenterService(subscriptionContext, "fakeResourceGroup", "fakeServiceName");
        const importPayload: ApiCenterRulesetImport = {
            value: "fakeValue",
            format: ApiCenterRulesetImportFormat.InlineZip,
        };

        const response = await apiCenterService.importRuleset(importPayload, "fakeConfigName");

        assert.strictEqual(response.isSuccessful, false);
        assert.strictEqual(response.message, "error");
    });
    it("checkResourceGroup not existed", async () => {
        const mockResponse = {
            status: 204,
            parsedBody: { id: "fakeId", location: "fakeLocation", name: "fakeName" },
        } as HttpOperationResponse;
        const sendRequestStub = sandbox.stub(ServiceClient.prototype, "sendRequest");
        sendRequestStub.onFirstCall().resolves(mockResponse);

        const apiCenterService = new ApiCenterService(subscriptionContext, "fakeResourceGroup", "fakeServiceName");
        const response = await apiCenterService.isResourceGroupExist();

        assert.strictEqual(response, true);
    });
    it("checkResourceGroup existed", async () => {
        const mockResponse = {
            status: 400,
            parsedBody: { id: "fakeId", location: "fakeLocation", name: "fakeName" },
        } as HttpOperationResponse;
        const sendRequestStub = sandbox.stub(ServiceClient.prototype, "sendRequest");
        sendRequestStub.onFirstCall().resolves(mockResponse);

        const apiCenterService = new ApiCenterService(subscriptionContext, "fakeResourceGroup", "fakeServiceName");
        const response = await apiCenterService.isResourceGroupExist();

        assert.strictEqual(response, false);
    });
    it("createOrUpdateResourceGroup succeeded", async () => {
        const mockResponse = {
            status: 200,
            parsedBody: { id: "fakeId", location: "fakeLocation", name: "fakeName" },
        } as HttpOperationResponse;

        const sendRequestStub = sandbox.stub(ServiceClient.prototype, "sendRequest");
        sendRequestStub.onFirstCall().resolves(mockResponse);

        const apiCenterService = new ApiCenterService(subscriptionContext, "fakeResourceGroup", "fakeServiceName");
        const response = await apiCenterService.createOrUpdateResourceGroup("fakeLocation");
        assert.strictEqual(response.id, "fakeId");
        assert.strictEqual(response.location, "fakeLocation");
        assert.strictEqual(response.name, "fakeName");
    });
    it("createOrUpdateAPICenterService succeeded", async () => {
        const mockResponse = {
            status: 200,
            parsedBody: { id: "fakeId", location: "fakeLocation", name: "fakeName", provisioningState: "Succeeded" },
        } as HttpOperationResponse;

        const sendRequestStub = sandbox.stub(ServiceClient.prototype, "sendRequest");
        sendRequestStub.onFirstCall().resolves(mockResponse);

        const apiCenterService = new ApiCenterService(subscriptionContext, "fakeResourceGroup", "fakeServiceName");
        const response = await apiCenterService.createOrUpdateApiCenterService("fakeLocation");
        assert.strictEqual(response.id, "fakeId");
        assert.strictEqual(response.location, "fakeLocation");
        assert.strictEqual(response.name, "fakeName");
        assert.strictEqual(response.provisioningState, "Succeeded");
    });
    it("createOrUpdateAPICenterService that provisioning", async () => {
        const mockResponse = {
            status: 400,
            parsedBody: { id: "fakeId", location: "fakeLocation", name: "fakeName", provisioningState: "provisioning" },
        } as HttpOperationResponse;

        const sendRequestStub = sandbox.stub(ServiceClient.prototype, "sendRequest");
        sendRequestStub.onFirstCall().resolves(mockResponse);

        const apiCenterService = new ApiCenterService(subscriptionContext, "fakeResourceGroup", "fakeServiceName");
        const response = await apiCenterService.createOrUpdateApiCenterService("fakeLocation");

        assert.strictEqual(response.provisioningState, "provisioning");
    });
    it("getSubServerList success", async () => {
        const mockResponse = {
            status: 400,
            parsedBody: { id: "fakeId", namespace: "Microsoft.ApiCenter", registrationPolicy: "RegistrationRequired", registrationState: "Registered" },
        } as HttpOperationResponse;
        const sendRequestStub = sandbox.stub(ServiceClient.prototype, "sendRequest");
        sendRequestStub.onFirstCall().resolves(mockResponse);
        const apiCenterService = new ApiCenterService(subscriptionContext, "fakeResourceGroup", "fakeServiceName");
        const response = await apiCenterService.getSubServerList();
        assert.strictEqual(response.namespace, "Microsoft.ApiCenter");
    });
});
