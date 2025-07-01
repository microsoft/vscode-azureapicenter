// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import { ApiCenterApi, ApiCenterApiVersion, DataPlaneApiCenterApi, DataPlaneApiCenterApiVersion } from "../../../../azure/ApiCenter/contracts";
import { ApiCenterVersionDataplane, ApiCenterVersionManagement, ApiCenterVersionsDataplane, ApiCenterVersionsManagement } from "../../../../azure/ApiCenterDefines/ApiCenterVersion";
describe('ApiCenterVersionsManagement class test', () => {
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
    it('ApiCenterVersionsManagement getName', () => {
        let obj: ApiCenterVersionsManagement = new ApiCenterVersionsManagement(data);
        let res = obj.getName();
        assert.equal(res, 'fakeName');
    });
});
describe('ApiCneterVersionsDataplane class test', () => {
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
    it('ApiCneterVersionsDataplane getName', () => {
        let obj: ApiCenterVersionsDataplane = new ApiCenterVersionsDataplane(data);
        let res = obj.getName();
        assert.equal(res, 'fakeName');
    });
});
describe('ApiCenterVersionManagement class test', () => {
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
    it('ApiCenterVersionManagement getName', () => {
        let obj: ApiCenterVersionManagement = new ApiCenterVersionManagement(data);
        let res = obj.getName();
        assert.equal(res, 'fakeName');
    });
    it('ApiCenterVersionManagement getLabel', () => {
        let obj: ApiCenterVersionManagement = new ApiCenterVersionManagement(data);
        let res = obj.getLabel();
        assert.equal(res, 'fakeTitle');
    });
});
describe('ApiCenterVersionDataplane class test', () => {
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
    it('ApiCenterVersionDataplane getName', () => {
        let obj: ApiCenterVersionDataplane = new ApiCenterVersionDataplane(data);
        let res = obj.getName();
        assert.equal(res, 'fakeName');
    });
    it('ApiCenterVersionDataplane getLabel', () => {
        let obj: ApiCenterVersionDataplane = new ApiCenterVersionDataplane(data);
        let res = obj.getLabel();
        assert.equal(res, 'fakeName');
    });
});
