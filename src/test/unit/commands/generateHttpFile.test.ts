// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as sinon from "sinon";
import { GenerateHttpFile } from "../../../commands/generateHttpFile";
import { OpenApiUtils } from "../../../utils/openApiUtils";

suite("generateHttpFile", () => {
    let sandbox = null as any;
    suiteSetup(() => {
        sandbox = sinon.createSandbox();
    });
    teardown(() => {
        sandbox.restore();
    });
    test("repair API - JSON", async () => {
        await testHttpFileGeneration("repairJson");
    });
    test("repair API - YAML", async () => {
        await testHttpFileGeneration("repairYaml");
    });
    test("header with parameters", async () => {
        await testHttpFileGeneration("header");
    });
    test("query string with parameters", async () => {
        await testHttpFileGeneration("queryString");
    });
    test("body using json-schema-faker", async () => {
        await testHttpFileGeneration("body");
    });
    test("example value", async () => {
        await testHttpFileGeneration("example");
    });
    test("default value", async () => {
        await testHttpFileGeneration("default");
    });
    test("no url", async () => {
        await testHttpFileGeneration("noUrl");
    });
    test("multiple urls", async () => {
        await testHttpFileGeneration("multiUrls");
    });
});

async function testHttpFileGeneration(scenario: string): Promise<void> {
    const openApiFileContent = await fs.promises.readFile(path.join(__dirname, "..", "..", "resources", "generateHttpFile", scenario, "openapi"), 'utf8');
    const expectedHttpFileContent = (await fs.promises.readFile(path.join(__dirname, "..", "..", "resources", "generateHttpFile", scenario, "expected.http"), 'utf8')).replace(/\r\n/g, '\n');

    const actualHttpFileContent = await generateHttpFileContent(openApiFileContent);

    assert.match(actualHttpFileContent + "\n", new RegExp(expectedHttpFileContent, "m"));
}

async function generateHttpFileContent(openApiFileContent: string): Promise<string> {
    const api = await OpenApiUtils.pasreDefinitionFileRawToOpenAPIV3FullObject(openApiFileContent);
    const httpFileContent = GenerateHttpFile.pasreSwaggerObjectToHttpFileContent(api);

    return httpFileContent;
}
