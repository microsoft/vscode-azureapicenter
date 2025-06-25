// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { RegisterMCP } from "../../../commands/registerMCP";
import { ext } from "../../../extensionVariables";
import { ApiCenterTreeItem } from "../../../tree/ApiCenterTreeItem";
import { ApisTreeItem } from "../../../tree/ApisTreeItem";

describe("registerMCP test cases", () => {
    let sandbox: sinon.SinonSandbox;
    let mockApiCenterService: sinon.SinonStubbedInstance<ApiCenterService>;
    let mockNode: sinon.SinonStubbedInstance<ApisTreeItem>;
    let mockApiCenterTreeItem: sinon.SinonStubbedInstance<ApiCenterTreeItem>;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock vscode.window functions
        sandbox.stub(vscode.window, 'showInputBox');
        sandbox.stub(vscode.window, 'showQuickPick');
        sandbox.stub(vscode.window, 'showWarningMessage');
        sandbox.stub(vscode.window, 'showInformationMessage');
        sandbox.stub(vscode.window, 'withProgress');

        // Mock ApiCenterService
        mockApiCenterService = sandbox.createStubInstance(ApiCenterService);
        sandbox.stub(ApiCenterService.prototype, 'getApiCenterEnvironments').resolves({
            value: [{ name: 'test-env' }, { name: 'prod-env' }]
        } as any);

        // Mock tree items
        mockNode = sandbox.createStubInstance(ApisTreeItem);
        mockApiCenterTreeItem = sandbox.createStubInstance(ApiCenterTreeItem);

        // Mock ext.treeDataProvider
        sandbox.stub(ext, 'treeDataProvider').value({
            showTreeItemPicker: sandbox.stub().resolves(mockApiCenterTreeItem)
        });

        // Mock createApiMCP function
        sandbox.stub(RegisterMCP, 'createApiMCP').resolves();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should successfully register MCP when all inputs are provided', async () => {
        // Arrange
        const context = { telemetry: { properties: {}, measurements: {} } };
        const mockApiCenter = { getId: () => '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service', getName: () => 'test-service' };
        const mockSubscription = { subscriptionId: 'test-sub' };

        mockNode.apiCenter = mockApiCenter as any;
        mockNode.refresh = sandbox.stub();

        (vscode.window.showInputBox as sinon.SinonStub)
            .onFirstCall().resolves('test-mcp-api')
            .onSecondCall().resolves('https://test-endpoint.com')
            .onThirdCall().resolves('v1.0');

        (vscode.window.showQuickPick as sinon.SinonStub)
            .onFirstCall().resolves('test-env')
            .onSecondCall().resolves('development');

        // Act
        await RegisterMCP.registerMCP(context as any, mockNode as any);

        // Assert
        sandbox.assert.calledOnce(RegisterMCP.createApiMCP as sinon.SinonStub);
        sandbox.assert.calledOnce(mockNode.refresh);
    });

    it('should throw UserCancelledError when API name is not provided', async () => {
        // Arrange
        const context = { telemetry: { properties: {}, measurements: {} } };
        const mockApiCenter = { getId: () => '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service', getName: () => 'test-service' };
        const mockSubscription = { subscriptionId: 'test-sub' };

        mockNode.apiCenter = mockApiCenter as any;

        (vscode.window.showInputBox as sinon.SinonStub).onFirstCall().resolves(undefined);

        // Act & Assert
        try {
            await RegisterMCP.registerMCP(context as any, mockNode as any);
            assert.fail('Expected UserCancelledError to be thrown');
        } catch (error) {
            assert.equal(error, UserCancelledError);
        }
    });

    it('should throw UserCancelledError when endpoint is not provided', async () => {
        // Arrange
        const context = { telemetry: { properties: {}, measurements: {} } };
        const mockApiCenter = { getId: () => '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service', getName: () => 'test-service' };
        const mockSubscription = { subscriptionId: 'test-sub' };

        mockNode.apiCenter = mockApiCenter as any;

        (vscode.window.showInputBox as sinon.SinonStub)
            .onFirstCall().resolves('test-mcp-api')
            .onSecondCall().resolves(undefined);

        // Act & Assert
        try {
            await RegisterMCP.registerMCP(context as any, mockNode as any);
            assert.fail('Expected UserCancelledError to be thrown');
        } catch (error) {
            assert.equal(error, UserCancelledError);
        }
    });

    it('should show warning when no environments are found', async () => {
        // Arrange
        const context = { telemetry: { properties: {}, measurements: {} } };
        const mockApiCenter = { getId: () => '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service', getName: () => 'test-service' };
        const mockSubscription = { subscriptionId: 'test-sub' };

        mockNode.apiCenter = mockApiCenter as any;

        (ApiCenterService.prototype.getApiCenterEnvironments as sinon.SinonStub).resolves({
            value: []
        });

        (vscode.window.showInputBox as sinon.SinonStub)
            .onFirstCall().resolves('test-mcp-api')
            .onSecondCall().resolves('https://test-endpoint.com');

        // Act
        await RegisterMCP.registerMCP(context as any, mockNode as any);

        // Assert
        sandbox.assert.calledOnce(vscode.window.showWarningMessage as sinon.SinonStub);
    });

    it('should use tree picker when node is not provided', async () => {
        // Arrange
        const context = { telemetry: { properties: {}, measurements: {} } };
        // mockApiCenterTreeItem.apisTreeItem = mockNode as any;

        const mockApiCenter = { getId: () => '/subscriptions/test/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service', getName: () => 'test-service' };
        const mockSubscription = { subscriptionId: 'test-sub' };

        mockNode.apiCenter = mockApiCenter as any;
        mockNode.refresh = sandbox.stub();

        (vscode.window.showInputBox as sinon.SinonStub)
            .onFirstCall().resolves('test-mcp-api')
            .onSecondCall().resolves('https://test-endpoint.com')
            .onThirdCall().resolves('v1.0');

        (vscode.window.showQuickPick as sinon.SinonStub)
            .onFirstCall().resolves('test-env')
            .onSecondCall().resolves('development');

        // Act
        await RegisterMCP.registerMCP(context as any);

        // Assert
        sandbox.assert.calledOnce(ext.treeDataProvider.showTreeItemPicker as sinon.SinonStub);
        sandbox.assert.calledOnce(RegisterMCP.createApiMCP as sinon.SinonStub);
    });
});
