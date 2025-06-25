// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtTreeDataProvider, UserCancelledError } from "@microsoft/vscode-azext-utils";
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { RegisterMCP } from "../../../commands/registerMCP";
import { ApiCenterTreeItem } from "../../../tree/ApiCenterTreeItem";
import { ApisTreeItem } from "../../../tree/ApisTreeItem";
describe("registerMCP test cases", () => {
    let sandbox: sinon.SinonSandbox;
    let mockNode: sinon.SinonStubbedInstance<ApisTreeItem>;
    let mockApiCenterTreeItem: sinon.SinonStubbedInstance<ApiCenterTreeItem>;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock tree items
        mockNode = sandbox.createStubInstance(ApisTreeItem);
        mockApiCenterTreeItem = sandbox.createStubInstance(ApiCenterTreeItem);


        // Mock ext.treeDataProvider
        sandbox.stub(AzExtTreeDataProvider.prototype, "showTreeItemPicker").resolves(
            mockApiCenterTreeItem
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should successfully register MCP when all inputs are provided', async () => {
        // Arrange
        const context = { telemetry: { properties: {}, measurements: {} } };
        const mockApiCenter = { getId: () => '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service', getName: () => 'test-service' };

        mockNode.apiCenter = mockApiCenter as any;
        mockNode.refresh = sandbox.stub();
        sandbox.stub(ApiCenterService.prototype, "getApiCenterEnvironments").resolves({
            value: [{ name: 'test-env' }, { name: 'prod-env' }]
        } as any);
        sandbox.stub(vscode.window, "showInputBox")
            .onFirstCall().resolves('test-mcp-api')
            .onSecondCall().resolves('https://test-endpoint.com')
            .onThirdCall().resolves('v1.0');

        sandbox.stub(vscode.window, "showQuickPick")
            .onFirstCall().resolves('test-env' as any)
            .onSecondCall().resolves('development' as any);
        const createApiMCPStub = sandbox.stub(RegisterMCP, "createApiMCP").resolves();
        // Act
        await RegisterMCP.registerMCP(context as any, mockNode as any);

        // Assert
        sandbox.assert.calledOnce(createApiMCPStub);
        sandbox.assert.calledOnce(mockNode.refresh);
    });

    it('should throw UserCancelledError when API name is not provided', async () => {
        // Arrange
        const context = { telemetry: { properties: {}, measurements: {} } };
        const mockApiCenter = { getId: () => '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service', getName: () => 'test-service' };

        mockNode.apiCenter = mockApiCenter as any;

        sandbox.stub(vscode.window, "showInputBox").onFirstCall().resolves(undefined);

        // Act & Assert
        try {
            await RegisterMCP.registerMCP(context as any, mockNode as any);
        } catch (error) {
            assert.instanceOf(error, UserCancelledError);
        }
    });

    it('should throw UserCancelledError when endpoint is not provided', async () => {
        // Arrange
        const context = { telemetry: { properties: {}, measurements: {} } };
        const mockApiCenter = { getId: () => '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service', getName: () => 'test-service' };

        mockNode.apiCenter = mockApiCenter as any;

        sandbox.stub(vscode.window, "showInputBox")
            .onFirstCall().resolves('test-mcp-api')
            .onSecondCall().resolves(undefined);

        // Act & Assert
        try {
            await RegisterMCP.registerMCP(context as any, mockNode as any);
            assert.fail('Expected UserCancelledError to be thrown');
        } catch (error) {
            assert.instanceOf(error, UserCancelledError);
        }
    });

    it('should show warning when no environments are found', async () => {
        // Arrange
        const context = { telemetry: { properties: {}, measurements: {} } };
        const mockApiCenter = { getId: () => '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service', getName: () => 'test-service' };

        mockNode.apiCenter = mockApiCenter as any;
        const showWarningStub = sandbox.stub(vscode.window, "showWarningMessage").resolves();

        sandbox.stub(ApiCenterService.prototype, 'getApiCenterEnvironments').resolves({ value: [] } as any);

        sandbox.stub(vscode.window, "showInputBox")
            .onFirstCall().resolves('test-mcp-api')
            .onSecondCall().resolves('https://test-endpoint.com');

        // Act
        await RegisterMCP.registerMCP(context as any, mockNode as any);

        // Assert
        sandbox.assert.calledOnce(showWarningStub);
    });

});
