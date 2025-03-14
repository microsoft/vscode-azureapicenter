// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as sinon from "sinon";
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { GenerateHttpFile } from "../../../commands/generateHttpFile";
import { ApiVersionDefinitionTreeItem } from "../../../tree/ApiVersionDefinitionTreeItem";
import { OpenApiUtils } from "../../../utils/openApiUtils";

describe("generateHttpFile", () => {
    let sandbox: sinon.SinonSandbox;
    let node: ApiVersionDefinitionTreeItem;
    before(() => {
        node = {
            subscription: "test-subscription",
            id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test",
            apiCenterName: "test-api-center",
            apiCenterApiName: "test-api",
            apiCenterApiVersionName: "v1"
        } as unknown as ApiVersionDefinitionTreeItem;
    });
    beforeEach(() => {
        sandbox = sinon.createSandbox();

    });
    afterEach(() => {
        sandbox.restore();
    });
    it("repair API - JSON", async () => {
        setupForNoAuth();
        await testHttpFileGeneration("repairJson");
    });
    it("repair API - YAML", async () => {
        setupForNoAuth();
        await testHttpFileGeneration("repairYaml");
    });
    it("header with parameters", async () => {
        setupForNoAuth();
        await testHttpFileGeneration("header");
    });
    it("query string with parameters", async () => {
        setupForNoAuth();
        await testHttpFileGeneration("queryString");
    });
    it("body using json-schema-faker", async () => {
        setupForNoAuth();
        await testHttpFileGeneration("body");
    });
    it("example value", async () => {
        setupForNoAuth();
        await testHttpFileGeneration("example");
    });
    it("default value", async () => {
        setupForNoAuth();
        await testHttpFileGeneration("default");
    });
    it("no url", async () => {
        setupForNoAuth();
        await testHttpFileGeneration("noUrl");
    });
    it("multiple urls", async () => {
        setupForNoAuth();
        await testHttpFileGeneration("multiUrls");
    });
    it("auth", async () => {
        sandbox.stub(ApiCenterService.prototype, "getApiCenterApiAccesses").resolves({
            value: [{
                type: "Microsoft.ApiCenter/services/workspaces/apis/versions/securityRequirements",
                properties: {
                    authConfigResourceId: "/authConfigs/repair-service-apiKey"
                },
                id: "/subscriptions/1756abc0-3554-4341-8d6a-46674962ea19/resourceGroups/jun-1109/providers/Microsoft.ApiCenter/services/jun-apiaccess-20250212/workspaces/default/apis/repair-service-with-custom-api-key/versions/v1/securityRequirements/repair-service-apiKey-sr",
                name: "repair-service-apiKey-sr"
            }], nextLink: ""
        });
        sandbox.stub(ApiCenterService.prototype, "getApiCenterAuthConfigs").resolves({
            value: [{
                type: "Microsoft.ApiCenter/services/workspaces/authConfigs",
                properties: {
                    title: "Default access",
                    description: "Default access to the API.",
                    securityScheme: "apiKey",
                    apiKey: {
                        in: "header",
                        name: "X-API-KEY",
                    },
                },
                id: "/subscriptions/1756abc0-3554-4341-8d6a-46674962ea19/resourceGroups/jun-1109/providers/Microsoft.ApiCenter/services/jun-apiaccess-20250212/workspaces/default/authConfigs/repair-service-apiKey",
                name: "repair-service-apiKey",
            }], nextLink: ""
        });
        sandbox.stub(ApiCenterService.prototype, "getApiCenterApiCredential").resolves({
            securityScheme: "apiKey",
            apiKey: {
                value: "mysecretvalue",
                in: "header",
                name: "X-API-KEY"
            }
        });
        await testHttpFileGeneration("auth");
    });

    function setupForNoAuth() {
        sandbox.stub(ApiCenterService.prototype, "getApiCenterApiAccesses").resolves({ value: [], nextLink: "" });
        sandbox.stub(ApiCenterService.prototype, "getApiCenterAuthConfigs").resolves({ value: [], nextLink: "" });
        sandbox.stub(ApiCenterService.prototype, "getApiCenterApiCredential").resolves({
            securityScheme: "apiKey",
            apiKey: {
                value: "mysecretvalue",
                in: "header",
                name: "X-API-KEY"
            }
        });
    }

    async function testHttpFileGeneration(scenario: string): Promise<void> {
        const openApiFileContent = await fs.promises.readFile(path.join(__dirname, "..", "..", "resources", "generateHttpFile", scenario, "openapi"), 'utf8');
        const expectedHttpFileContent = (await fs.promises.readFile(path.join(__dirname, "..", "..", "resources", "generateHttpFile", scenario, "expected.http"), 'utf8')).replace(/\r\n/g, '\n');

        const actualHttpFileContent = await generateHttpFileContent(openApiFileContent);

        assert.match(actualHttpFileContent + "\n", new RegExp(expectedHttpFileContent, "m"));
    }

    async function generateHttpFileContent(openApiFileContent: string): Promise<string> {
        const api = await OpenApiUtils.pasreDefinitionFileRawToOpenAPIV3FullObject(openApiFileContent);
        const httpFileContent = await GenerateHttpFile.pasreSwaggerObjectToHttpFileContent(api, node);

        return httpFileContent;
    }
});
