// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import { assert } from "chai";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { ApiCenterEnvironment } from "../../../azure/ApiCenter/contracts";
import { generateApicEnv } from "../../../commands/createApicEnv";
import { ApiCenterEnvironmentServerType, ContinueToSkip, EnvironmentKind } from "../../../constants";
import { ApiCenterTreeItem } from "../../../tree/ApiCenterTreeItem";
import { EnvironmentsTreeItem } from "../../../tree/EnvironmentsTreeItem";

describe("createApicEnv", () => {
    let sandbox: sinon.SinonSandbox;
    let mockEnvironmentsTreeItem: EnvironmentsTreeItem;
    let mockApiCenterTreeItem: ApiCenterTreeItem;
    let context: IActionContext;
    let withProgressStub: sinon.SinonStub;
    let showInputBoxStub: sinon.SinonStub;
    let showQuickPickStub: sinon.SinonStub;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        showInputBoxStub = sandbox.stub(vscode.window, "showInputBox");
        showQuickPickStub = sandbox.stub(vscode.window, "showQuickPick");
        withProgressStub = sandbox.stub(vscode.window, 'withProgress');
        withProgressStub.callsFake(async (options, task) => {
            await task({ report: () => { } }, { isCancellationRequested: false });
        });
        // Mock API Center
        const mockApiCenter = {
            id: "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-service",
            name: "test-service"
        };

        // Mock subscription
        const mockSubscription = {
            subscriptionId: "test-sub",
            displayName: "Test Subscription"
        };

        // Mock parent with subscription
        const mockParent = {
            subscription: mockSubscription
        };

        // Mock EnvironmentsTreeItem
        mockEnvironmentsTreeItem = {
            apiCenter: mockApiCenter,
            parent: mockParent,
            refresh: sandbox.stub()
        } as any;

        // Mock ApiCenterTreeItem
        mockApiCenterTreeItem = {
            environmentsTreeItem: mockEnvironmentsTreeItem
        } as any;

        // Mock context
        context = {
            telemetry: {
                properties: {},
                measurements: {}
            }
        } as IActionContext;
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should create environment with server configuration successfully", async () => {
        // Arrange
        const apiEnvName = "test-environment";
        const envKind = EnvironmentKind.production;
        const serverType = ApiCenterEnvironmentServerType.AzureAPIManagement;
        const serverEndpoint = "https://test-apim.azure-api.net";

        // Mock user inputs
        showInputBoxStub
            .onFirstCall().resolves(apiEnvName) // Environment name
            .onSecondCall().resolves(serverEndpoint); // Server endpoint

        showQuickPickStub
            .onFirstCall().resolves("production" as any) // Environment kind
            .onSecondCall().resolves("Azure API Management" as any); // Server type

        // Mock API Center Service
        const createOrUpdateStub = sandbox.stub(ApiCenterService.prototype, "createOrUpdateApiCenterEnvironment").resolves({} as any);

        // Act
        await generateApicEnv(context, mockEnvironmentsTreeItem);

        // Assert
        sandbox.assert.calledOnce(createOrUpdateStub);
        sandbox.assert.calledWithExactly(createOrUpdateStub, {
            name: 'test-environment',
            properties: {
                kind: 'production',
                server: {
                    type: 'Azure API Management',
                    managementPortalUri: ['https://test-apim.azure-api.net']
                }
            }
        } as ApiCenterEnvironment);
        sandbox.assert.calledOnce(mockEnvironmentsTreeItem.refresh as any);
    });

    it("should create environment without server configuration when Continue to skip is selected", async () => {
        // Arrange
        const apiEnvName = "test-environment";
        const envKind = EnvironmentKind.development;

        showInputBoxStub
            .onFirstCall().resolves(apiEnvName);

        showQuickPickStub
            .onFirstCall().resolves(envKind as any)
            .onSecondCall().resolves(ContinueToSkip as any);

        const createOrUpdateStub = sandbox.stub(ApiCenterService.prototype, "createOrUpdateApiCenterEnvironment").resolves({} as any);



        // Act
        await generateApicEnv(context, mockEnvironmentsTreeItem);

        // Assert
        sandbox.assert.calledOnce(createOrUpdateStub);
        sandbox.assert.calledWithExactly(createOrUpdateStub, {
            name: apiEnvName,
            properties: {
                kind: envKind,
                server: {}
            }
        } as ApiCenterEnvironment);
    });

    it("should throw UserCancelledError when environment name is not provided", async () => {
        // Arrange
        showInputBoxStub.resolves(undefined);

        // Act & Assert
        try {
            await generateApicEnv(context, mockEnvironmentsTreeItem);
            assert.fail("Expected UserCancelledError to be thrown");
        } catch (error) {
            assert.instanceOf(error, UserCancelledError);
        }
    });

    it("should throw UserCancelledError when environment kind is not selected", async () => {
        // Arrange
        showInputBoxStub.resolves("test-environment");
        showQuickPickStub.resolves(undefined);

        // Act & Assert
        try {
            await generateApicEnv(context, mockEnvironmentsTreeItem);
            assert.fail("Expected UserCancelledError to be thrown");
        } catch (error) {
            assert.instanceOf(error, UserCancelledError);
        }
    });

    it("should create environment with empty server when endpoint is not provided", async () => {
        // Arrange
        const apiEnvName = "test-environment";
        const envKind = EnvironmentKind.development;
        const serverType = ApiCenterEnvironmentServerType.k8s;

        showInputBoxStub
            .onFirstCall().resolves(apiEnvName)
            .onSecondCall().resolves(undefined); // No endpoint provided

        showQuickPickStub
            .onFirstCall().resolves(envKind as any)
            .onSecondCall().resolves(serverType as any);

        const createOrUpdateStub = sandbox.stub(ApiCenterService.prototype, "createOrUpdateApiCenterEnvironment").resolves({} as any);
        // Act
        await generateApicEnv(context, mockEnvironmentsTreeItem);

        // Assert
        sandbox.assert.calledOnce(createOrUpdateStub);
        sandbox.assert.calledWithExactly(createOrUpdateStub, {
            name: apiEnvName,
            properties: {
                kind: envKind,
                server: {}
            }
        } as ApiCenterEnvironment);
    });
});
