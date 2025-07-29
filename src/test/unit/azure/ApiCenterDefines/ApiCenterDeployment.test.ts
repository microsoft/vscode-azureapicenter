// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import { ApiCenterDataPlaneService } from "../../../../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenterService } from "../../../../azure/ApiCenter/ApiCenterService";
import { ApiCenterDeploymentDataplane, ApiCenterDeploymentManagement, ApiCenterDeploymentsDataplane, ApiCenterDeploymentsManagement } from "../../../../azure/ApiCenterDefines/ApiCenterDeployment";
describe("Azure ApiCenter Defines ApiCenterDeploymentsManagement", () => {
    let sandbox: sinon.SinonSandbox;
    let data: any;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        data = {
            id: "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service/environments/env1/deployments/id1",
            name: "fakeName",
            properties: { title: "fakeTitle", server: { runtimeUri: ["http://runtime"] } }
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("getName", () => {
        const obj = new ApiCenterDeploymentsManagement(data);
        assert.strictEqual(obj.getName(), "fakeName");
    });
    it("getNextLink and _nextLink", () => {
        const obj = new ApiCenterDeploymentsManagement(data);
        obj._nextLink = "next";
        assert.strictEqual(obj.getNextLink(), "next");
    });
    it("getChild returns deployments", async () => {
        const obj = new ApiCenterDeploymentsManagement(data);
        const fakeDeployments = {
            nextLink: "next",
            value: [{
                name: "dep1",
                id: "fakeId",
                type: "fakeType",
                properties: {
                    title: "t1",
                    server: { runtimeUri: ["uri1"] },
                    environmentId: "env1",
                    definitionId: "def1"
                }
            }]
        };
        sandbox.stub(ApiCenterService.prototype, "getApiCenterApiDeployments").resolves(fakeDeployments);
        const res = await obj.getChild({} as any, "apiName");
        assert.strictEqual(res.length, 1);
        assert.strictEqual(obj.getNextLink(), "next");
        assert.strictEqual(res[0].name, "dep1");
    });
    it("generateChild returns ApiCenterDeploymentManagement", () => {
        const obj = new ApiCenterDeploymentsManagement(data);
        const child = obj.generateChild({
            name: "dep1",
            id: "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service/environments/env1/deployments/id1",
            type: "fakeType",
            properties: {
                title: "t1",
                server: { runtimeUri: ["uri1"] },
                environmentId: "env1",
                definitionId: "def1"
            }
        });
        assert.ok(child instanceof ApiCenterDeploymentManagement);
        assert.strictEqual(child.getName(), "dep1");
    });
});
describe("Azure ApiCenter Defines ApiCenterDeploymentsDataplane", () => {
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
        const obj = new ApiCenterDeploymentsDataplane(data);
        assert.strictEqual(obj.getName(), "fakeName");
    });
    it("getNextLink and _nextLink", () => {
        const obj = new ApiCenterDeploymentsDataplane(data);
        obj._nextLink = "next";
        assert.strictEqual(obj.getNextLink(), "next");
    });
    it("getChild returns deployments", async () => {
        const obj = new ApiCenterDeploymentsDataplane(data);
        const fakeDeployments = {
            nextLink: "next",
            value: [{
                name: "dep1",
                server: { runtimeUri: ["uri1"] },
                title: "t1",
                environment: "env1",
                recommended: false
            }]
        };
        sandbox.stub(ApiCenterDataPlaneService.prototype, "listApiDeployments").resolves(fakeDeployments);
        const res = await obj.getChild({} as any, "apiName");
        assert.strictEqual(res.length, 1);
        assert.strictEqual(obj.getNextLink(), "next");
        assert.strictEqual(res[0].name, "dep1");
    });
    it("generateChild returns ApiCenterDeploymentDataplane", () => {
        const obj = new ApiCenterDeploymentsDataplane(data);
        const child = obj.generateChild({
            name: "dep1",
            server: { runtimeUri: ["uri1"] },
            title: "t1",
            environment: "env1",
            recommended: false
        });
        assert.ok(child instanceof ApiCenterDeploymentDataplane);
        assert.strictEqual(child.getName(), "dep1");
    });
});
describe("Azure ApiCenter Defines ApiCenterDeploymentManagement", () => {
    let data: any;
    beforeEach(() => {
        data = { id: "id1", name: "dep1", properties: { title: "t1", server: { runtimeUri: ["uri1"] } } };
    });
    it("getContext", () => {
        const obj = new ApiCenterDeploymentManagement(data);
        assert.strictEqual(obj.getContext(), "azureApiCenterApiDeployment");
    });
    it("getRuntimeUris", () => {
        const obj = new ApiCenterDeploymentManagement(data);
        assert.deepStrictEqual(obj.getRuntimeUris(), ["uri1"]);
    });
    it("getLabel", () => {
        const obj = new ApiCenterDeploymentManagement(data);
        assert.strictEqual(obj.getLabel(), "t1");
    });
    it("getId", () => {
        const obj = new ApiCenterDeploymentManagement(data);
        assert.strictEqual(obj.getId(), "id1");
    });
    it("getName", () => {
        const obj = new ApiCenterDeploymentManagement(data);
        assert.strictEqual(obj.getName(), "dep1");
    });
});
describe("Azure ApiCenter Defines ApiCenterDeploymentDataplane", () => {
    let data: any;
    beforeEach(() => {
        data = { name: "dep1", server: { runtimeUri: ["uri1"] }, title: "t1" };
    });
    it("getContext", () => {
        const obj = new ApiCenterDeploymentDataplane(data);
        assert.strictEqual(obj.getContext(), "azureApiCenterDataPlaneApiDeployment");
    });
    it("getRuntimeUris", () => {
        const obj = new ApiCenterDeploymentDataplane(data);
        assert.deepStrictEqual(obj.getRuntimeUris(), ["uri1"]);
    });
    it("getLabel", () => {
        const obj = new ApiCenterDeploymentDataplane(data);
        assert.strictEqual(obj.getLabel(), "t1");
    });
    it("getId", () => {
        const obj = new ApiCenterDeploymentDataplane(data);
        assert.strictEqual(obj.getId(), "dep1");
    });
    it("getName", () => {
        const obj = new ApiCenterDeploymentDataplane(data);
        assert.strictEqual(obj.getName(), "dep1");
    });
});
