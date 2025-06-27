// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import { TelemetryClient } from "../../../common/telemetryClient";
import { GenerateOpenApi } from "../../../copilot/generateOpenApi";
import { getPlugins } from "../../../copilot/getPlugins";
import { LocalPluginArgs } from "../../../types/AzureAgent";

describe("getPlugins", () => {
    let sendEventStub: sinon.SinonStub;
    let sendErrorEventStub: sinon.SinonStub;
    let sandbox: sinon.SinonSandbox;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        sendEventStub = sandbox.stub(TelemetryClient, "sendEvent");
        sendErrorEventStub = sandbox.stub(TelemetryClient, "sendErrorEvent");
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should return the correct plugin manifest and handler", async () => {
        const result = await getPlugins();
        assert.strictEqual(result.plugins.length, 1);
        const plugin = result.plugins[0];
        assert.strictEqual(plugin.manifest.name, "ApiCenterPlugin");
        assert.strictEqual(plugin.manifest.version, "1.0.0");
        assert.strictEqual(plugin.manifest.functions.length, 1);
        assert.strictEqual(plugin.manifest.functions[0].name, "generate_openapi");
    });

    it("should execute the generate_openapi function successfully", async () => {
        const args: LocalPluginArgs = {
            localPluginRequest: {
                functionName: "generate_openapi",
            },
        } as LocalPluginArgs;
        const handleGenerateOpenApiStub = sandbox.stub(GenerateOpenApi, "handleGenerateOpenApi").resolves({});

        const result = await getPlugins();
        const plugin = result.plugins[0];
        const response = await plugin.handler.execute(args);

        assert.ok(response);
        assert.strictEqual(sendEventStub.calledWith("azure-api-center.agent.generate_openapi.start"), true);
        assert.strictEqual(sendEventStub.calledWith("azure-api-center.agent.generate_openapi.end"), true);
        assert.strictEqual(handleGenerateOpenApiStub.calledOnce, true);
    });

    it("should handle unknown function names gracefully", async () => {
        const args: LocalPluginArgs = {
            localPluginRequest: {
                functionName: "unknown_function",
            },
        } as LocalPluginArgs;

        const result = await getPlugins();
        const plugin = result.plugins[0];
        const response = await plugin.handler.execute(args);

        assert.strictEqual((response as any).result, "Error: Function not found.");
        assert.strictEqual(sendEventStub.calledWith("azure-api-center.agent.unknown_function.start"), true);
        assert.strictEqual(sendEventStub.calledWith("azure-api-center.agent.unknown_function.end"), true);
    });

    it("should handle errors and send error events", async () => {
        const args: LocalPluginArgs = {
            localPluginRequest: {
                functionName: "generate_openapi",
            },
        } as LocalPluginArgs;
        const error = new Error("Test error");
        const handleGenerateOpenApiStub = sandbox.stub(GenerateOpenApi, "handleGenerateOpenApi").rejects(error);

        const result = await getPlugins();
        const plugin = result.plugins[0];

        try {
            await plugin.handler.execute(args);
        } catch (err) {
            assert.strictEqual(err, error);
        }

        assert.strictEqual(sendEventStub.calledWith("azure-api-center.agent.generate_openapi.start"), true);
        assert.strictEqual(sendEventStub.calledWith("azure-api-center.agent.generate_openapi.end"), false);
        assert.strictEqual(sendErrorEventStub.calledOnce, true);
        assert.strictEqual(handleGenerateOpenApiStub.calledOnce, true);
    });
});
