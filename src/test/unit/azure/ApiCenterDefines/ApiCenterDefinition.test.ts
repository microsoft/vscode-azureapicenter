// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import { ApiCenterApiVersion, ApiCenterApiVersionDefinition, DataPlaneApiCenterApiVersion, DataPlaneApiCenterApiVersionDefinition } from "../../../../azure/ApiCenter/contracts";
import { ApiCenterVersionDefinitionDataPlane, ApiCenterVersionDefinitionManagement, ApiCenterVersionDefinitionsDataplane, ApiCenterVersionDefinitionsManagement } from "../../../../azure/ApiCenterDefines/ApiCenterDefinition";

describe('ApiCenterVersionDefinitionsManagement class test', () => {
    let sandbox = null as any;
    let data: ApiCenterApiVersion;
    before(() => {
        sandbox = sinon.createSandbox();
        data = {
            id: "fakeId",
            location: "fakeLocation",
            name: "fakeName",
            properties: {
                title: "fakeTitle",
                lifecycleStage: "fakeStage"
            },
            type: "fakeType"
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("ApiCenterVersionDefinitionsManagement getName", () => {
        let obj: ApiCenterVersionDefinitionsManagement = new ApiCenterVersionDefinitionsManagement(data);
        let res = obj.getName();
        assert.equal(res, "fakeName");
    });
});
describe('ApiCenterVersionDefinitionsDataplane class test', () => {
    let sandbox = null as any;
    let data: DataPlaneApiCenterApiVersion;
    before(() => {
        sandbox = sinon.createSandbox();
        data = {
            name: "fakeName",
            title: "fakeTitle",
            lifecycleStage: "fakeStage"
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("ApiCenterVersionDefinitionsDataplane getName", () => {
        let obj: ApiCenterVersionDefinitionsDataplane = new ApiCenterVersionDefinitionsDataplane(data);
        let res = obj.getName();
        assert.equal(res, "fakeName");
    });
});
describe('ApiCenterVersionDefinitionManagement class test', () => {
    let sandbox = null as any;
    let data: ApiCenterApiVersionDefinition;
    before(() => {
        sandbox = sinon.createSandbox();
        data = {
            id: "fakeId",
            location: "fakeLocation",
            name: "fakeName",
            properties: {
                title: "fakeTitle",
                specification: {
                    name: "fakeSpecName",
                    version: "fakeVersion"
                }
            },
            type: "fakeType"
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("ApiCenterVersionDefinitionManagement getLabel", () => {
        let obj: ApiCenterVersionDefinitionManagement = new ApiCenterVersionDefinitionManagement(data);
        let res = obj.getLabel();
        assert.equal(res, "fakeTitle");
    });
    it("ApiCenterVersionDefinitionManagement getId", () => {
        let obj: ApiCenterVersionDefinitionManagement = new ApiCenterVersionDefinitionManagement(data);
        let res = obj.getId();
        assert.equal(res, "fakeId");
    });
    it("ApiCenterVersionDefinitionManagement getContext", () => {
        let obj: ApiCenterVersionDefinitionManagement = new ApiCenterVersionDefinitionManagement(data);
        let res = obj.getContext();
        assert.equal(res, "azureApiCenterApiVersionDefinitionTreeItem-fakespecname");
    });
    it("ApiCenterVersionDefinitionManagement getName", () => {
        let obj: ApiCenterVersionDefinitionManagement = new ApiCenterVersionDefinitionManagement(data);
        let res = obj.getName();
        assert.equal(res, "fakeName");
    });
});
describe('ApiCenterVersionDefinitionDataPlane class test', () => {
    let sandbox = null as any;
    let data: DataPlaneApiCenterApiVersionDefinition = {
        name: "",
        title: "",
        specification: {
            name: ""
        }
    };
    before(() => {
        sandbox = sinon.createSandbox();
        data = {
            name: "fakeName",
            title: "fakeTitle",
            specification: {
                name: "fakeSpecName"
            }
        };
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("ApiCenterVersionDefinitionDataPlane getLabel", () => {
        let obj: ApiCenterVersionDefinitionDataPlane = new ApiCenterVersionDefinitionDataPlane(data);
        let res = obj.getLabel();
        assert.equal(res, "fakeName");
    });
    it("ApiCenterVersionDefinitionDataPlane getId", () => {
        let obj: ApiCenterVersionDefinitionDataPlane = new ApiCenterVersionDefinitionDataPlane(data);
        let res = obj.getId();
        assert.equal(res, "fakeName");
    });
    it("ApiCenterVersionDefinitionDataPlane getContext", () => {
        let obj: ApiCenterVersionDefinitionDataPlane = new ApiCenterVersionDefinitionDataPlane(data);
        let res = obj.getContext();
        assert.equal(res, "azureApiCenterApiVersionDataPlaneDefinitionTreeItem-fakespecname");
    });
    it("ApiCenterVersionDefinitionDataPlane getName", () => {
        let obj: ApiCenterVersionDefinitionDataPlane = new ApiCenterVersionDefinitionDataPlane(data);
        let res = obj.getName();
        assert.equal(res, "fakeName");
    });
});
