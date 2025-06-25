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
    let withProgressStub: sinon.SinonStub;
    let showInputBoxStub: sinon.SinonStub;
    let showQuickPickStub: sinon.SinonStub;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        // Mock tree items
        mockNode = sandbox.createStubInstance(ApisTreeItem);
        mockApiCenterTreeItem = sandbox.createStubInstance(ApiCenterTreeItem);
        withProgressStub = sandbox.stub(vscode.window, 'withProgress');
        showInputBoxStub = sandbox.stub(vscode.window, "showInputBox");
        showQuickPickStub = sandbox.stub(vscode.window, "showQuickPick");
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
        showInputBoxStub
            .onFirstCall().resolves('test-mcp-api')
            .onSecondCall().resolves('https://test-endpoint.com')
            .onThirdCall().resolves('v1.0');

        showQuickPickStub
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

        showInputBoxStub.onFirstCall().resolves(undefined);

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

        showInputBoxStub
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

        showInputBoxStub
            .onFirstCall().resolves('test-mcp-api')
            .onSecondCall().resolves('https://test-endpoint.com');

        // Act
        await RegisterMCP.registerMCP(context as any, mockNode as any);

        // Assert
        sandbox.assert.calledOnce(showWarningStub);
    });

    it('should generate MCP spec with correct values', async () => {
        // Arrange
        const mcpVersion = 'v1.0';
        const mcpApiName = 'test-mcp-api';
        const mcpEndpoint = 'https://test-endpoint.com';

        // Mock the file system operations
        const mockFileContent = JSON.stringify({
            info: {
                version: '',
                title: ''
            },
            servers: []
        });

        sandbox.stub(require('fs-extra'), 'readFile').resolves(mockFileContent);

        // Act
        const result = await RegisterMCP.generateMCPSpec(mcpVersion, mcpApiName, mcpEndpoint);

        // Assert
        assert.exists(result);
        assert.equal(result.format, 'inline');
        assert.exists(result.value);
        assert.exists(result.specification);
        assert.equal(result.specification.name, 'openapi');

        // Parse the generated JSON to verify content
        const generatedSpec = JSON.parse(result.value);
        assert.equal(generatedSpec.info.version, mcpVersion);
        assert.equal(generatedSpec.info.title, mcpApiName);
        assert.isArray(generatedSpec.servers);
        assert.equal(generatedSpec.servers.length, 1);
        assert.equal(generatedSpec.servers[0].url, mcpEndpoint);
    });

    it('should generate correct deployment object for MCP', () => {
        // Arrange
        const mcpApiName = 'test-mcp-api';
        const apiVersionName = 'v1-0';
        const mcpDefinitionName = 'mcp';
        const envSelected = 'test-env';
        const mcpEndpoint = 'https://test-endpoint.com';

        // Act
        const deployment = RegisterMCP.getDeploymentForMCP(
            mcpApiName,
            apiVersionName,
            mcpDefinitionName,
            envSelected,
            mcpEndpoint
        );

        // Assert
        assert.equal(deployment.name, 'default-deployment');
        assert.equal(deployment.type, 'Microsoft.ApiCenter/services/workspaces/apis/deployments');

        assert.exists(deployment.properties);
        assert.equal(deployment.properties.title, `Deployment to ${mcpApiName}`);
        assert.equal(deployment.properties.definitionId, `/workspaces/default/apis/${mcpApiName}/versions/${apiVersionName}/definitions/${mcpDefinitionName}`);
        assert.equal(deployment.properties.environmentId, `/workspaces/default/environments/${envSelected}`);
        assert.equal(deployment.properties.isDefault, true);

        assert.exists(deployment.properties.server);
        assert.isArray(deployment.properties.server.runtimeUri);
        assert.equal(deployment.properties.server.runtimeUri.length, 1);
        assert.equal(deployment.properties.server.runtimeUri[0], mcpEndpoint);
    });

    it('should successfully create API MCP with all components', async () => {
        // Arrange
        const mcpApiName = 'test-mcp-api';
        const mcpVersion = 'v1.0';
        const apiVersionLifecycleStage = 'development';
        const envSelected = 'test-env';
        const mcpEndpoint = 'https://test-endpoint.com';

        const mockApiCenterService = sandbox.createStubInstance(ApiCenterService);

        // Mock all service method responses
        mockApiCenterService.createOrUpdateApi.resolves({} as any);
        mockApiCenterService.createOrUpdateApiVersion.resolves({} as any);
        mockApiCenterService.createOrUpdateApiVersionDefinition.resolves({} as any);
        mockApiCenterService.importSpecification.resolves({} as any);
        mockApiCenterService.createOrUpdateApiDeployment.resolves({} as any);

        // Mock file system for generateMCPSpec
        const mockFileContent = JSON.stringify({
            info: { version: '', title: '' },
            servers: []
        });
        sandbox.stub(require('fs-extra'), 'readFile').resolves(mockFileContent);

        // Mock progress and window
        withProgressStub.callsFake(async (options, task) => {
            await task({ report: () => { } }, { isCancellationRequested: false });
        });
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage');

        // Act
        await RegisterMCP.createApiMCP(
            mockApiCenterService as any,
            mcpApiName,
            mcpVersion,
            apiVersionLifecycleStage,
            envSelected,
            mcpEndpoint
        );

        // Assert
        // Verify API creation
        sandbox.assert.calledOnceWithExactly(
            mockApiCenterService.createOrUpdateApi,
            sandbox.match({
                name: mcpApiName,
                properties: {
                    title: mcpApiName,
                    kind: 'mcp'
                }
            })
        );

        // Verify API version creation
        sandbox.assert.calledOnceWithExactly(
            mockApiCenterService.createOrUpdateApiVersion,
            mcpApiName,
            sandbox.match({
                name: 'v1-0',
                properties: {
                    title: 'v1.0',
                    lifecycleStage: 'development'
                }
            })
        );

        // Verify definition creation
        sandbox.assert.calledOnceWithExactly(
            mockApiCenterService.createOrUpdateApiVersionDefinition,
            mcpApiName,
            'v1-0',
            sandbox.match({
                name: 'mcp',
                properties: {
                    title: `SSE Definition for ${mcpApiName}`
                }
            })
        );

        // Verify import specification
        sandbox.assert.calledOnceWithExactly(
            mockApiCenterService.importSpecification,
            mcpApiName,
            'v1-0',
            'mcp',
            sandbox.match({
                format: 'inline',
                value: sandbox.match.string,
                specification: { name: 'openapi' }
            })
        );

        // Verify deployment creation
        sandbox.assert.calledOnceWithExactly(
            mockApiCenterService.createOrUpdateApiDeployment,
            mcpApiName,
            sandbox.match({
                name: 'default-deployment',
                type: 'Microsoft.ApiCenter/services/workspaces/apis/deployments'
            })
        );

        // Verify success message
        sandbox.assert.calledOnce(showInfoStub);
    });

    it('should throw error when API creation fails', async () => {
        // Arrange
        const mcpApiName = 'test-mcp-api';
        const mcpVersion = 'v1.0';
        const apiVersionLifecycleStage = 'development';
        const envSelected = 'test-env';
        const mcpEndpoint = 'https://test-endpoint.com';
        const errorMessage = 'API creation failed';

        const mockApiCenterService = sandbox.createStubInstance(ApiCenterService);
        mockApiCenterService.createOrUpdateApi.throws({ message: errorMessage });

        withProgressStub.callsFake(async (options, task) => {
            await task({ report: () => { } }, { isCancellationRequested: false });
        });

        // Act & Assert
        try {
            await RegisterMCP.createApiMCP(
                mockApiCenterService as any,
                mcpApiName,
                mcpVersion,
                apiVersionLifecycleStage,
                envSelected,
                mcpEndpoint
            );
            assert.fail('Expected error to be thrown');
        } catch (error: any) {
            assert.equal(error.message, errorMessage);
        }
    });

});
