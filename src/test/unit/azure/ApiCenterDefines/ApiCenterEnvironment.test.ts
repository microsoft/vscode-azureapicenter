// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import { ApiCenterDataPlaneService } from "../../../../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenterService } from "../../../../azure/ApiCenter/ApiCenterService";
import { ApiCenterEnvironmentServerType } from "../../../../azure/ApiCenter/contracts";
import { ApiCenterEnvironmentDataplane, ApiCenterEnvironmentManagement, ApiCenterEnvironmentsDataplane, ApiCenterEnvironmentsManagement } from "../../../../azure/ApiCenterDefines/ApiCenterEnvironment";
describe("Azure ApiCenter Defines ApiCenterEnvironmentsManagement", () => {
    let sandbox: sinon.SinonSandbox;
    let data: any;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        data = {
            id: "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service",
            name: "fakeName",
            properties: {
                portalHostname: "fakePortalHostname",
                dataApiHostname: "fakeDataApiHostname"
            },
            location: "fakeLocation",
            resourceGroup: "fakeRG",
            provisioningState: "Succeeded",
            type: "fakeType"
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("getId", () => {
        const obj = new ApiCenterEnvironmentsManagement(data);
        assert.strictEqual(obj.getId(), "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service");
    });
    it("getName", () => {
        const obj = new ApiCenterEnvironmentsManagement(data);
        assert.strictEqual(obj.getName(), "fakeName");
    });
    it("getNextLink and _nextLink", () => {
        const obj = new ApiCenterEnvironmentsManagement(data);
        obj._nextLink = "next";
        assert.strictEqual(obj.getNextLink(), "next");
    });
    it("getChild returns environments", async () => {
        const obj = new ApiCenterEnvironmentsManagement(data);
        const fakeEnvs = {
            nextLink: "next",
            value: [{
                id: "envId1",
                name: "envName1",
                type: "envType",
                location: "envLocation",
                properties: {
                    title: "envTitle1",
                    kind: "kind1",
                    server: { type: "serverType1", managementPortalUri: ["uri1"] }
                }
            }]
        };
        sandbox.stub(ApiCenterService.prototype, "getApiCenterEnvironments").resolves(fakeEnvs);
        const res = await obj.getChild({} as any, "apiName");
        assert.strictEqual(res.length, 1);
        assert.strictEqual(obj.getNextLink(), "next");
        assert.strictEqual(res[0].name, "envName1");
    });
    it("generateChild returns ApiCenterEnvironmentManagement", () => {
        const obj = new ApiCenterEnvironmentsManagement(data);
        const child = obj.generateChild({
            id: "envId1",
            name: "envName1",
            type: "envType",
            location: "envLocation",
            properties: {
                title: "envTitle1",
                kind: "kind1",
                server: { type: "serverType1", managementPortalUri: ["uri1"] }
            }
        });
        assert.ok(child instanceof ApiCenterEnvironmentManagement);
        assert.strictEqual(child.getName(), "envName1");
    });
});
describe("Azure ApiCenter Defines ApiCenterEnvironmentsDataplane", () => {
    let sandbox: sinon.SinonSandbox;
    let data: any;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        data = { name: "fakeName" };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("getName", () => {
        const obj = new ApiCenterEnvironmentsDataplane(data);
        assert.strictEqual(obj.getName(), "fakeName");
    });
    it("getNextLink and _nextLink", () => {
        const obj = new ApiCenterEnvironmentsDataplane(data);
        obj._nextLink = "next";
        assert.strictEqual(obj.getNextLink(), "next");
    });
    it("getChild returns environments", async () => {
        const obj = new ApiCenterEnvironmentsDataplane(data);
        const fakeEnvs = {
            nextLink: "next",
            value: [{
                name: "envName1",
                title: "envTitle1",
                kind: "kind1",
                server: { type: ApiCenterEnvironmentServerType.AzureAPIManagement, managementPortalUris: ["uri1"] }
            }]
        };
        sandbox.stub(ApiCenterDataPlaneService.prototype, "listApiEnvrionments").resolves(fakeEnvs);
        const res = await obj.getChild({} as any, "apiName");
        assert.strictEqual(res.length, 1);
        assert.strictEqual(obj.getNextLink(), "next");
        assert.strictEqual(res[0].name, "envName1");
    });
    it("generateChild returns ApiCenterEnvironmentDataplane", () => {
        const obj = new ApiCenterEnvironmentsDataplane(data);
        const child = obj.generateChild({
            name: "envName1",
            title: "envTitle1",
            kind: "kind1",
            server: { type: ApiCenterEnvironmentServerType.AzureAPIManagement, managementPortalUris: ["uri1"] }
        });
        assert.ok(child instanceof ApiCenterEnvironmentDataplane);
        assert.strictEqual(child.getName(), "envName1");
    });
});
describe("Azure ApiCenter Defines ApiCenterEnvironmentManagement", () => {
    let data: any;
    beforeEach(() => {
        data = {
            id: "envId1",
            name: "envName1",
            type: "envType",
            properties: {
                title: "envTitle1",
                kind: "kind1",
                server: { managementPortalUri: ["uri1"] }
            }
        };
    });
    it("getManagementPortalUris", () => {
        const obj = new ApiCenterEnvironmentManagement(data);
        assert.deepStrictEqual(obj.getManagementPortalUris(), ["uri1"]);
    });
    it("getContext", () => {
        const obj = new ApiCenterEnvironmentManagement(data);
        assert.strictEqual(obj.getContext(), "azureApiCenterEnvironments");
    });
    it("getLabel", () => {
        const obj = new ApiCenterEnvironmentManagement(data);
        assert.strictEqual(obj.getLabel(), "envTitle1");
    });
    it("getId", () => {
        const obj = new ApiCenterEnvironmentManagement(data);
        assert.strictEqual(obj.getId(), "envId1");
    });
    it("getName", () => {
        const obj = new ApiCenterEnvironmentManagement(data);
        assert.strictEqual(obj.getName(), "envName1");
    });
    it("getKind", () => {
        const obj = new ApiCenterEnvironmentManagement(data);
        assert.strictEqual(obj.getKind(), "kind1");
    });
});
describe("Azure ApiCenter Defines ApiCenterEnvironmentDataplane", () => {
    let data: any;
    beforeEach(() => {
        data = {
            name: "envName1",
            title: "envTitle1",
            kind: "kind1",
            server: { managementPortalUris: ["uri1"] }
        };
    });
    it("getKind", () => {
        const obj = new ApiCenterEnvironmentDataplane(data);
        assert.strictEqual(obj.getKind(), "kind1");
    });
    it("getManagementPortalUris", () => {
        const obj = new ApiCenterEnvironmentDataplane(data);
        assert.deepStrictEqual(obj.getManagementPortalUris(), ["uri1"]);
    });
    it("getContext", () => {
        const obj = new ApiCenterEnvironmentDataplane(data);
        assert.strictEqual(obj.getContext(), "azureApiCenterDataPlaneEnvironments");
    });
    it("getLabel", () => {
        const obj = new ApiCenterEnvironmentDataplane(data);
        assert.strictEqual(obj.getLabel(), "envTitle1");
    });
    it("getId", () => {
        const obj = new ApiCenterEnvironmentDataplane(data);
        assert.strictEqual(obj.getId(), "envTitle1");
    });
    it("getName", () => {
        const obj = new ApiCenterEnvironmentDataplane(data);
        assert.strictEqual(obj.getName(), "envName1");
    });
});
