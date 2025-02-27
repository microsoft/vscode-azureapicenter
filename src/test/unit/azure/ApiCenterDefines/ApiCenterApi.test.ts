// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import { ApiCenterDataPlaneService } from "../../../../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenter, ApiCenterApi, DataPlaneApiCenter, DataPlaneApiCenterApi } from "../../../../azure/ApiCenter/contracts";
import { ApiCenterApiDataPlane, ApiCenterApiManagement, ApiCenterApisDataplane, ApiCenterApisManagement } from "../../../../azure/ApiCenterDefines/ApiCenterApi";
describe('Azure ApiCenter Defines ApiCenterApisManagement', () => {
    let sandbox = null as any;
    let data: ApiCenter;
    before(() => {
        sandbox = sinon.createSandbox();
        data = {
            id: "fakeId",
            location: "fakeLocation",
            name: "fakeName",
            resourceGroup: "fakeRG",
            properties: {},
            type: "fakeType"
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("ApiCenterApisManagement class getId", () => {
        const api: ApiCenterApisManagement = new ApiCenterApisManagement(data);
        const res = api.getId();
        assert.strictEqual("fakeId", res);
    });
    it("ApiCenterApisManagement class getName", () => {
        const api: ApiCenterApisManagement = new ApiCenterApisManagement(data);
        const res = api.getName();
        assert.strictEqual("fakeName", res);
    });
});
describe('Azure ApiCenter Defines ApiCenterApisDataplane', () => {
    let sandbox = null as any;
    let data: DataPlaneApiCenter;
    before(() => {
        sandbox = sinon.createSandbox();
        data = {
            name: "fakeName"
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("ApiCenterApisDataplane class getId", () => {
        const api: ApiCenterApisDataplane = new ApiCenterApisDataplane(data);
        const res = api.getId();
        assert.strictEqual("fakeName", res);
    });
    it("ApiCenterApisDataplane class getName", () => {
        const api: ApiCenterApisDataplane = new ApiCenterApisDataplane(data);
        const res = api.getName();
        assert.strictEqual("fakeName", res);
    });
    it("ApiCenterApisDataplane class getChild empty", async () => {
        const api: ApiCenterApisDataplane = new ApiCenterApisDataplane(data);
        sandbox.stub(ApiCenterDataPlaneService.prototype, "getApiCenterApis").resolves(undefined);
        const res = await api.getChild(context as any, "fakeContent");
        assert.strictEqual(res.length, 0);
    });
    it("ApiCenterApisDataplane class getChild with 1 api", async() => {
        const api: ApiCenterApisDataplane = new ApiCenterApisDataplane(data);
        sandbox.stub(ApiCenterDataPlaneService.prototype, "getApiCenterApis").resolves({
            nextLink: "fakeNextLink",
            value: [
                {
                    name: "fakeName",
                    title: "fakeTitle",
                    kind: "fakeKind",
                    lifecycleStage: "fakeStage",
                    externalDocumentation: [],
                    contacts: [],
                    customProperties: {}
                }
            ]
        });
        const res = await api.getChild(context as any, "fakeContent");
        assert.strictEqual(res.length, 1);
        assert.strictEqual(res[0].name, "fakeName");
        assert.strictEqual(api.getNextLink(), "fakeNextLink");
    });
});
describe('Azure ApiCenter Defines ApiCenterApiManagement', () => {
    let sandbox = null as any;
    let data: ApiCenterApi;
    before(() => {
        sandbox = sinon.createSandbox();
        data = {
            id: "fakeId",
            location: "fakeLocation",
            name: "fakeName",
            properties: {
                title: "fakeTitle",
                kind: "fakeKind"
            },
            type: "fakeType"
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("ApiCenterApiManagement class getId", () => {
        const api: ApiCenterApiManagement = new ApiCenterApiManagement(data);
        const res = api.getId();
        assert.strictEqual("fakeId", res);
    });
    it('ApiCenterApiManagement class getName', () => {
        const api: ApiCenterApiManagement = new ApiCenterApiManagement(data);
        const res = api.getName();
        assert.strictEqual("fakeName", res);
    });
    it('ApiCenterApiManagement class getData', () => {
        const api: ApiCenterApiManagement = new ApiCenterApiManagement(data);
        const res = api.getData();
        assert.equal("fakeName", res.name);
        assert.equal("fakeId", res.id);
        assert.equal("fakeLocation", res.location);
        assert.equal("fakeTitle", res.properties.title);
    });
    it('ApiCenterApiManagement class getLabel', () => {
        const api: ApiCenterApiManagement = new ApiCenterApiManagement(data);
        const res = api.getLabel();
        assert.strictEqual(res, 'fakeTitle');
    });
});
describe('Azure ApiCenter Defines ApiCenterApiDataPlane', () => {
    let sandbox = null as any;
    let data: DataPlaneApiCenterApi;
    before(() => {
        sandbox = sinon.createSandbox();
        data = {
            name: "fakeName",
            title: "fakeTitle",
            kind: "fakeKind",
            lifecycleStage: "fakeStage",
            externalDocumentation: [],
            contacts: [],
            customProperties: {}
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('ApiCenterApiDataPlane getId', () => {
        let obj: ApiCenterApiDataPlane = new ApiCenterApiDataPlane(data);
        let res = obj.getId();
        assert.equal('fakeName', res);
    });
    it('ApiCenterApiDataPlane getLabel', () => {
        let obj: ApiCenterApiDataPlane = new ApiCenterApiDataPlane(data);
        let res = obj.getLabel();
        assert.equal('fakeName', res);
    });
    it('ApiCenterApiDataPlane getname', () => {
        let obj: ApiCenterApiDataPlane = new ApiCenterApiDataPlane(data);
        let res = obj.getName();
        assert.equal('fakeName', res);
    });
});
