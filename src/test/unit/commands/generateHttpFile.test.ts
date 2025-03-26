// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";
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
    it("apiKey basic", async () => {
        sandbox.stub(ApiCenterService.prototype, "getApiCenterApiAccesses").resolves({
            value: [{
                type: "Microsoft.ApiCenter/services/workspaces/apis/versions/securityRequirements",
                properties: {
                    authConfigResourceId: "/authConfigs/authConfig1",
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/apis/api/versions/v1/securityRequirements/securityRequirement1",
                name: "securityRequirement1"
            }, {
                type: "Microsoft.ApiCenter/services/workspaces/apis/versions/securityRequirements",
                properties: {
                    authConfigResourceId: "/authConfigs/authConfig2",
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/apis/api/versions/v1/securityRequirements/securityRequirement2",
                name: "securityRequirement2"
            }, {
                type: "Microsoft.ApiCenter/services/workspaces/apis/versions/securityRequirements",
                properties: {
                    authConfigResourceId: "/authConfigs/authConfig4",
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/apis/api/versions/v1/securityRequirements/securityRequirement4",
                name: "securityRequirement4"
            }, {
                type: "Microsoft.ApiCenter/services/workspaces/apis/versions/securityRequirements",
                properties: {
                    authConfigResourceId: "/authConfigs/authConfig5",
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/apis/api/versions/v1/securityRequirements/securityRequirement5",
                name: "securityRequirement5"
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
                        name: "x-api-key",
                    },
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/authConfigs/authConfig1",
                name: "authConfig1",
            }, {
                type: "Microsoft.ApiCenter/services/workspaces/authConfigs",
                properties: {
                    title: "Default access 2",
                    description: "Default access 2 to the API.",
                    securityScheme: "apiKey",
                    apiKey: {
                        in: "query",
                        name: "x-api-key-2",
                    },
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/authConfigs/authConfig2",
                name: "authConfig2",
            }, {
                type: "Microsoft.ApiCenter/services/workspaces/authConfigs",
                properties: {
                    title: "Default access 4",
                    description: "Default access 4 to the API.",
                    securityScheme: "apiKey",
                    apiKey: {
                        in: "cookie",
                        name: "x-api-key-4",
                    },
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/authConfigs/authConfig4",
                name: "authConfig4",
            }, {
                type: "Microsoft.ApiCenter/services/workspaces/authConfigs",
                properties: {
                    title: "Default access 5",
                    description: "Default access 5 to the API.",
                    securityScheme: "apiKey",
                    apiKey: {
                        in: "cookie",
                        name: "x-api-key-5",
                    },
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/authConfigs/authConfig5",
                name: "authConfig5",
            }], nextLink: ""
        });
        const getApiCenterApiCredentialStub = sandbox.stub(ApiCenterService.prototype, "getApiCenterApiCredential");
        getApiCenterApiCredentialStub.onFirstCall().resolves({
            securityScheme: "apiKey",
            apiKey: {
                value: "mysecretvalue",
                in: "header",
                name: "x-api-key"
            }
        });
        getApiCenterApiCredentialStub.onSecondCall().resolves({
            securityScheme: "apiKey",
            apiKey: {
                value: "mysecretvalue2",
                in: "query",
                name: "x-api-key-2"
            }
        });
        getApiCenterApiCredentialStub.onThirdCall().resolves({
            securityScheme: "apiKey",
            apiKey: {
                value: "mysecretvalue4",
                in: "cookie",
                name: "x-api-key-4"
            }
        });
        getApiCenterApiCredentialStub.onCall(3).resolves({
            securityScheme: "apiKey",
            apiKey: {
                value: "mysecretvalue5",
                in: "header",
                name: "x-api-key-5"
            }
        });
        await testHttpFileGeneration("apiKeyBasic");
    });
    it("apiKey QuickPick", async () => {
        sandbox.stub(ApiCenterService.prototype, "getApiCenterApiAccesses").resolves({
            value: [{
                type: "Microsoft.ApiCenter/services/workspaces/apis/versions/securityRequirements",
                properties: {
                    authConfigResourceId: "/authConfigs/authConfig1",
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/apis/api/versions/v1/securityRequirements/securityRequirement1",
                name: "securityRequirement1"
            }, {
                type: "Microsoft.ApiCenter/services/workspaces/apis/versions/securityRequirements",
                properties: {
                    authConfigResourceId: "/authConfigs/authConfig2",
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/apis/api/versions/v1/securityRequirements/securityRequirement2",
                name: "securityRequirement2"
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
                        name: "x-api-key",
                    },
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/authConfigs/authConfig1",
                name: "authConfig1",
            }, {
                type: "Microsoft.ApiCenter/services/workspaces/authConfigs",
                properties: {
                    title: "Default access 2",
                    description: "Default access 2 to the API.",
                    securityScheme: "apiKey",
                    apiKey: {
                        in: "header",
                        name: "x-api-key",
                    },
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/authConfigs/authConfig2",
                name: "authConfig2",
            }], nextLink: ""
        });
        sandbox.stub(ApiCenterService.prototype, "getApiCenterApiCredential").resolves({
            securityScheme: "apiKey",
            apiKey: {
                value: "mysecretvalue",
                in: "header",
                name: "x-api-key"
            }
        });
        const quickPickStub = sandbox.stub(vscode.window, "showQuickPick").resolves({
            label: "fakeName",
            value: {
                name: "fakeName"
            }
        } as unknown as vscode.QuickPickItem);
        await testHttpFileGeneration("apiKeyQuickPick");
        sandbox.assert.calledOnce(quickPickStub);
        sandbox.assert.calledWithMatch(quickPickStub, sinon.match.array, {
            placeHolder: 'Select Authentication for \'x-api-key\'',
        });
    });

    function setupForNoAuth() {
        sandbox.stub(ApiCenterService.prototype, "getApiCenterApiAccesses").resolves({ value: [], nextLink: "" });
        sandbox.stub(ApiCenterService.prototype, "getApiCenterAuthConfigs").resolves({ value: [], nextLink: "" });
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
