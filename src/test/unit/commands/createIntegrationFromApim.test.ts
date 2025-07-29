// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, ISubscriptionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { ApiCenter, ApiCenterApiSource, ApiCenterApiSourcePayload, ApiCenterPayload } from "../../../azure/ApiCenter/contracts";
import { AzureService } from "../../../azure/AzureService/AzureService";
import { RoleAssignmentPayload } from "../../../azure/AzureService/contracts";
import { ResourceGraphService } from "../../../azure/ResourceGraph/ResourceGraphService";
import { createIntegrationFromApim } from "../../../commands/createIntegrationFromApim";
import { ext } from "../../../extensionVariables";
import { IntegrationsTreeItem } from "../../../tree/IntegrationsTreeItem";
import { SubscriptionTreeItem } from "../../../tree/SubscriptionTreeItem";
import { UiStrings } from "../../../uiStrings";

describe("createIntegrationFromApim", () => {
    let sandbox: sinon.SinonSandbox;
    let mockContext: IActionContext;
    let mockSubscription: ISubscriptionContext;
    let mockNode: IntegrationsTreeItem;
    let apiCenterServiceStub: sinon.SinonStubbedInstance<ApiCenterService>;
    let azureServiceStub: sinon.SinonStubbedInstance<AzureService>;
    let resourceGraphServiceStub: sinon.SinonStubbedInstance<ResourceGraphService>;
    let subscriptionTreeItemStub: sinon.SinonStubbedInstance<SubscriptionTreeItem>;

    const mockApiCenter: ApiCenter = {
        id: "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-api-center",
        location: "East US",
        name: "test-api-center",
        resourceGroup: "test-rg",
        properties: {
            dataApiHostname: "test.example.com",
            portalHostname: "portal.example.com"
        },
        provisioningState: "Succeeded",
        sku: {
            name: "Free"
        },
        type: "Microsoft.ApiCenter/services"
    };

    const mockApiCenterWithIdentity: ApiCenter = {
        ...mockApiCenter,
        identity: {
            principalId: "test-principal-id",
            tenantId: "test-tenant-id",
            type: "SystemAssigned"
        }
    };

    const mockApims = [
        {
            id: "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim-1",
            name: "test-apim-1",
            location: "East US"
        },
        {
            id: "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim-2",
            name: "test-apim-2",
            location: "West US"
        }
    ];

    const mockApiSource: ApiCenterApiSource = {
        properties: {
            apiSourceType: "apim",
            apimSource: {
                resourceId: "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim-1",
                msiResourceId: "test-msi-id"
            },
            azureApiManagementSource: {
                resourceId: "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim-1",
                msiResourceId: "test-msi-id"
            },
            sourceLifecycleStage: "production",
            targetEnvironmentId: "test-env-id",
            targetLifecycleStage: "production",
            importSpecification: "openapi",
            linkState: {
                state: "linked",
                lastUpdatedOn: "2024-01-01T00:00:00Z"
            }
        },
        name: "test-integration",
        id: "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-api-center/integrations/test-integration",
        systemData: {
            createdAt: "2024-01-01T00:00:00Z",
            createdBy: "test-user",
            createdByType: "User",
            lastModifiedAt: "2024-01-01T00:00:00Z",
            lastModifiedBy: "test-user",
            lastModifiedByType: "User"
        },
        type: "Microsoft.ApiCenter/services/integrations"
    } as ApiCenterApiSource;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        mockContext = {} as IActionContext;
        mockSubscription = {
            subscriptionId: "test-sub",
            subscriptionDisplayName: "Test Subscription",
            tenantId: "test-tenant-id"
        } as ISubscriptionContext;

        mockNode = {
            subscription: mockSubscription,
            apiCenter: mockApiCenter,
            refresh: sandbox.stub()
        } as any as IntegrationsTreeItem;

        // Stub the getResourceGroupFromId function
        sandbox.stub({ getResourceGroupFromId }, 'getResourceGroupFromId').returns("test-rg");

        // Create stubs for service classes
        apiCenterServiceStub = sandbox.createStubInstance(ApiCenterService);
        azureServiceStub = sandbox.createStubInstance(AzureService);
        resourceGraphServiceStub = sandbox.createStubInstance(ResourceGraphService);
        subscriptionTreeItemStub = sandbox.createStubInstance(SubscriptionTreeItem);

        // Setup default return values
        apiCenterServiceStub.getApiCenter.resolves(mockApiCenter);
        apiCenterServiceStub.createOrUpdateApiCenterService.resolves(mockApiCenterWithIdentity);
        apiCenterServiceStub.createOrUpdateIntegration.resolves(mockApiSource);

        azureServiceStub.createOrUpdateRoleAssignment.resolves({ status: 201, bodyAsText: "" } as any);

        resourceGraphServiceStub.listApims.resolves(mockApims);
        Object.defineProperty(subscriptionTreeItemStub, 'subscription', {
            value: mockSubscription,
            writable: false,
            configurable: true
        });

        // Stub constructors
        sandbox.stub(ApiCenterService.prototype, "getApiCenter").callsFake(() => apiCenterServiceStub.getApiCenter());
        sandbox.stub(ApiCenterService.prototype, "createOrUpdateApiCenterService").callsFake((payload) => apiCenterServiceStub.createOrUpdateApiCenterService(payload));
        sandbox.stub(ApiCenterService.prototype, "createOrUpdateIntegration").callsFake((name, payload) => apiCenterServiceStub.createOrUpdateIntegration(name, payload));

        sandbox.stub(AzureService.prototype, "createOrUpdateRoleAssignment").callsFake((scope, payload) => azureServiceStub.createOrUpdateRoleAssignment(scope, payload));

        sandbox.stub(ResourceGraphService.prototype, "listApims").callsFake(() => resourceGraphServiceStub.listApims());

        // Setup ext.treeDataProvider mock
        ext.treeDataProvider = {
            showTreeItemPicker: sandbox.stub().resolves(subscriptionTreeItemStub)
        } as any;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("happy path", () => {
        it("should create integration successfully when API Center already has managed identity", async () => {
            // Arrange
            apiCenterServiceStub.getApiCenter.resolves(mockApiCenterWithIdentity);

            const showInputBoxStub = sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            const showQuickPickStub = sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            const withProgressStub = sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });
            const showInformationMessageStub = sandbox.stub(vscode.window, "showInformationMessage");

            // Act
            await createIntegrationFromApim(mockContext, mockNode);

            // Assert
            sandbox.assert.calledOnce(showInputBoxStub);
            sandbox.assert.calledOnce(showQuickPickStub);
            sandbox.assert.calledOnce(withProgressStub);
            sandbox.assert.calledOnce(apiCenterServiceStub.getApiCenter);
            sandbox.assert.notCalled(apiCenterServiceStub.createOrUpdateApiCenterService); // Should not update since identity exists
            sandbox.assert.calledOnce(azureServiceStub.createOrUpdateRoleAssignment);
            sandbox.assert.calledOnce(apiCenterServiceStub.createOrUpdateIntegration);
            sandbox.assert.calledOnce(showInformationMessageStub);
            sandbox.assert.calledOnce(mockNode.refresh as sinon.SinonStub);
        });

        it("should create integration successfully when API Center needs managed identity enabled", async () => {
            // Arrange
            const showInputBoxStub = sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            const showQuickPickStub = sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            const withProgressStub = sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });
            const showInformationMessageStub = sandbox.stub(vscode.window, "showInformationMessage");

            // Act
            await createIntegrationFromApim(mockContext, mockNode);

            // Assert
            sandbox.assert.calledOnce(showInputBoxStub);
            sandbox.assert.calledOnce(showQuickPickStub);
            sandbox.assert.calledOnce(withProgressStub);
            sandbox.assert.calledOnce(apiCenterServiceStub.getApiCenter);
            sandbox.assert.calledOnce(apiCenterServiceStub.createOrUpdateApiCenterService); // Should update to enable identity
            sandbox.assert.calledOnce(azureServiceStub.createOrUpdateRoleAssignment);
            sandbox.assert.calledOnce(apiCenterServiceStub.createOrUpdateIntegration);
            sandbox.assert.calledOnce(showInformationMessageStub);
            sandbox.assert.calledOnce(mockNode.refresh as sinon.SinonStub);

            // Verify the API Center update payload
            const updateCall = apiCenterServiceStub.createOrUpdateApiCenterService.getCall(0);
            const expectedPayload: ApiCenterPayload = {
                location: mockApiCenter.location,
                identity: {
                    type: "SystemAssigned"
                },
                sku: {
                    name: mockApiCenter.sku.name
                }
            };
            assert.deepStrictEqual(updateCall.args[0], expectedPayload);
        });

        it("should verify role assignment payload is correct", async () => {
            // Arrange
            apiCenterServiceStub.getApiCenter.resolves(mockApiCenterWithIdentity);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });
            sandbox.stub(vscode.window, "showInformationMessage");

            // Act
            await createIntegrationFromApim(mockContext, mockNode);

            // Assert
            const roleAssignmentCall = azureServiceStub.createOrUpdateRoleAssignment.getCall(0);
            const expectedScope = "subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim-1";
            const expectedPayload: RoleAssignmentPayload = {
                properties: {
                    roleDefinitionId: `/subscriptions/${mockSubscription.subscriptionId}/providers/Microsoft.Authorization/roleDefinitions/71522526-b88f-4d52-b57f-d31fc3546d0d`,
                    principalId: "test-principal-id",
                    principalType: "ServicePrincipal"
                }
            };

            assert.strictEqual(roleAssignmentCall.args[0], expectedScope);
            assert.deepStrictEqual(roleAssignmentCall.args[1], expectedPayload);
        });

        it("should verify integration creation payload is correct", async () => {
            // Arrange
            apiCenterServiceStub.getApiCenter.resolves(mockApiCenterWithIdentity);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });
            sandbox.stub(vscode.window, "showInformationMessage");

            // Act
            await createIntegrationFromApim(mockContext, mockNode);

            // Assert
            const integrationCall = apiCenterServiceStub.createOrUpdateIntegration.getCall(0);
            const expectedPayload: ApiCenterApiSourcePayload = {
                properties: {
                    apiSourceType: "apim",
                    apimSource: {
                        resourceId: "/subscriptions/test-sub/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-apim-1"
                    }
                }
            };

            assert.strictEqual(integrationCall.args[0], "test-integration");
            assert.deepStrictEqual(integrationCall.args[1], expectedPayload);
        });
    });

    describe("input validation", () => {
        it("should validate link name input correctly", async () => {
            // Arrange
            const showInputBoxStub = sandbox.stub(vscode.window, "showInputBox").resolves("valid-name");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });
            sandbox.stub(vscode.window, "showInformationMessage");

            // Act
            await createIntegrationFromApim(mockContext, mockNode);

            // Assert
            sandbox.assert.calledOnce(showInputBoxStub);

            // Verify input box options
            const inputBoxOptions = showInputBoxStub.getCall(0).args[0]!;
            assert.strictEqual(inputBoxOptions.title, UiStrings.LinkName);
            assert.strictEqual(inputBoxOptions.ignoreFocusOut, true);

            // Test validation function
            const validateInput = inputBoxOptions.validateInput!;
            assert.strictEqual(validateInput(""), UiStrings.LinkNameRequired);
            assert.strictEqual(validateInput("-invalid"), UiStrings.LinkNameInvalid);
            assert.strictEqual(validateInput("invalid-"), UiStrings.LinkNameInvalid);
            assert.strictEqual(validateInput("invalid name"), UiStrings.LinkNameInvalid);
            assert.strictEqual(validateInput("valid-name"), undefined);
            assert.strictEqual(validateInput("validname123"), undefined);
        });

        it("should throw UserCancelledError when link name input is cancelled", async () => {
            // Arrange
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "showInputBox").resolves(undefined);

            // Act & Assert
            await assert.rejects(
                createIntegrationFromApim(mockContext, mockNode),
                UserCancelledError
            );
        });

        it("should throw UserCancelledError when APIM selection is cancelled", async () => {
            // Arrange
            sandbox.stub(vscode.window, "showQuickPick").resolves(undefined);

            // Act & Assert
            await assert.rejects(
                createIntegrationFromApim(mockContext, mockNode),
                UserCancelledError
            );
        });
    });

    describe("error scenarios", () => {
        it("should throw error when no APIM services found", async () => {
            // Arrange
            resourceGraphServiceStub.listApims.resolves([]);
            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");

            // Act & Assert
            await assert.rejects(
                createIntegrationFromApim(mockContext, mockNode),
                { message: UiStrings.NoAPIManagementFound }
            );
        });

        it("should handle API Center service creation error with message property", async () => {
            // Arrange
            const errorResponse = { message: "Test error message" };
            apiCenterServiceStub.createOrUpdateApiCenterService.resolves(errorResponse as any);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });

            // Act & Assert
            await assert.rejects(
                createIntegrationFromApim(mockContext, mockNode),
                { message: "Test error message" }
            );
        });

        it("should handle API Center service creation error with error.message property", async () => {
            // Arrange
            const errorResponse = { error: { message: "Test nested error message" } };
            apiCenterServiceStub.createOrUpdateApiCenterService.resolves(errorResponse as any);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });

            // Act & Assert
            await assert.rejects(
                createIntegrationFromApim(mockContext, mockNode),
                { message: "Test nested error message" }
            );
        });

        it("should handle integration creation error", async () => {
            // Arrange
            apiCenterServiceStub.getApiCenter.resolves(mockApiCenterWithIdentity);
            const errorResponse = { message: "Integration creation failed" };
            apiCenterServiceStub.createOrUpdateIntegration.resolves(errorResponse as any);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });

            // Act & Assert
            await assert.rejects(
                createIntegrationFromApim(mockContext, mockNode),
                { message: "Integration creation failed" }
            );
        });

        it("should handle role assignment failure with status 500", async () => {
            // Arrange
            apiCenterServiceStub.getApiCenter.resolves(mockApiCenterWithIdentity);
            azureServiceStub.createOrUpdateRoleAssignment.resolves({
                status: 500,
                bodyAsText: "Internal server error"
            } as any);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });

            // Act & Assert
            const expectedMessage = vscode.l10n.t(UiStrings.FailedToAssignManagedIdentityReaderRole, "Internal server error");
            await assert.rejects(
                createIntegrationFromApim(mockContext, mockNode),
                { message: expectedMessage }
            );
        });

        it("should handle role assignment failure with empty body", async () => {
            // Arrange
            apiCenterServiceStub.getApiCenter.resolves(mockApiCenterWithIdentity);
            azureServiceStub.createOrUpdateRoleAssignment.resolves({
                status: 500,
                bodyAsText: null
            } as any);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });

            // Act & Assert
            const expectedMessage = vscode.l10n.t(UiStrings.FailedToAssignManagedIdentityReaderRole, "");
            await assert.rejects(
                createIntegrationFromApim(mockContext, mockNode),
                { message: expectedMessage }
            );
        });

        it("should accept role assignment conflict (409) as success", async () => {
            // Arrange
            apiCenterServiceStub.getApiCenter.resolves(mockApiCenterWithIdentity);
            azureServiceStub.createOrUpdateRoleAssignment.resolves({
                status: 409,
                bodyAsText: "Role assignment already exists"
            } as any);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });
            const showInformationMessageStub = sandbox.stub(vscode.window, "showInformationMessage");

            // Act
            await createIntegrationFromApim(mockContext, mockNode);

            // Assert - Should not throw error and should complete successfully
            sandbox.assert.calledOnce(showInformationMessageStub);
            sandbox.assert.calledOnce(mockNode.refresh as sinon.SinonStub);
        });
    });

    describe("progress and UI feedback", () => {
        it("should show correct progress message", async () => {
            // Arrange
            apiCenterServiceStub.getApiCenter.resolves(mockApiCenterWithIdentity);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            const withProgressStub = sandbox.stub(vscode.window, "withProgress");
            sandbox.stub(vscode.window, "showInformationMessage");

            // Act
            await createIntegrationFromApim(mockContext, mockNode);

            // Assert
            sandbox.assert.calledOnce(withProgressStub);
            const progressOptions = withProgressStub.getCall(0).args[0];
            assert.strictEqual(progressOptions.location, vscode.ProgressLocation.Notification);
            assert.strictEqual(progressOptions.title, UiStrings.CreatingIntegration);
        });

        it("should show success message with integration name", async () => {
            // Arrange
            apiCenterServiceStub.getApiCenter.resolves(mockApiCenterWithIdentity);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });
            const showInformationMessageStub = sandbox.stub(vscode.window, "showInformationMessage");

            // Act
            await createIntegrationFromApim(mockContext, mockNode);

            // Assert
            sandbox.assert.calledOnce(showInformationMessageStub);
            const expectedMessage = vscode.l10n.t(UiStrings.IntegrationCreated, mockApiSource.name);
            sandbox.assert.calledWith(showInformationMessageStub, expectedMessage);
        });

        it("should refresh tree node after successful creation", async () => {
            // Arrange
            apiCenterServiceStub.getApiCenter.resolves(mockApiCenterWithIdentity);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });
            sandbox.stub(vscode.window, "showInformationMessage");

            // Act
            await createIntegrationFromApim(mockContext, mockNode);

            // Assert
            sandbox.assert.calledOnce(mockNode.refresh as sinon.SinonStub);
            sandbox.assert.calledWith(mockNode.refresh as sinon.SinonStub, mockContext);
        });
    });

    describe("APIM selection", () => {
        it("should show correct APIM selection prompt", async () => {
            // Arrange
            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            const showQuickPickStub = sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });
            sandbox.stub(vscode.window, "showInformationMessage");

            // Act
            await createIntegrationFromApim(mockContext, mockNode);

            // Assert
            sandbox.assert.calledOnce(showQuickPickStub);
            const quickPickCall = showQuickPickStub.getCall(0);
            const expectedApimNames = ["test-apim-1", "test-apim-2"];
            const quickPickOptions = quickPickCall.args[1]!;

            assert.deepStrictEqual(quickPickCall.args[0], expectedApimNames);
            assert.strictEqual(quickPickOptions.title, UiStrings.SelectAPIManagementService);
            assert.strictEqual(quickPickOptions.ignoreFocusOut, true);
        });

        it("should use correct subscription for ResourceGraphService", async () => {
            // Arrange
            const treePickerStub = ext.treeDataProvider.showTreeItemPicker as sinon.SinonStub;

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });
            sandbox.stub(vscode.window, "showInformationMessage");

            // Act
            await createIntegrationFromApim(mockContext, mockNode);

            // Assert
            sandbox.assert.calledOnce(treePickerStub);
            sandbox.assert.calledWith(treePickerStub, SubscriptionTreeItem.contextValue, mockContext);
        });
    });

    describe("node parameter handling", () => {
        it("should handle undefined node by prompting for API Center selection", async () => {
            // Arrange
            const mockApiCenterTreeItem = {
                integrationsTreeItem: {
                    subscription: mockSubscription,
                    apiCenter: mockApiCenter,
                    refresh: sandbox.stub()
                }
            };

            // Update the tree data provider stub to return ApiCenterTreeItem instead of SubscriptionTreeItem for the first call
            const treePickerStub = ext.treeDataProvider.showTreeItemPicker as sinon.SinonStub;
            treePickerStub.onFirstCall().resolves(mockApiCenterTreeItem);
            treePickerStub.onSecondCall().resolves(subscriptionTreeItemStub);

            apiCenterServiceStub.getApiCenter.resolves(mockApiCenterWithIdentity);

            sandbox.stub(vscode.window, "showInputBox").resolves("test-integration");
            sandbox.stub(vscode.window, "showQuickPick").resolves("test-apim-1" as any);
            sandbox.stub(vscode.window, "withProgress").callsFake(async (options, callback) => {
                return await callback({} as any, {} as any);
            });
            const showInformationMessageStub = sandbox.stub(vscode.window, "showInformationMessage");

            // Act - Call with undefined node
            await createIntegrationFromApim(mockContext, undefined);

            // Assert
            sandbox.assert.calledTwice(treePickerStub);
            sandbox.assert.calledWith(treePickerStub.firstCall, "azureApiCenter", mockContext);
            sandbox.assert.calledWith(treePickerStub.secondCall, "azureApiCenterAzureSubscription", mockContext);
            sandbox.assert.calledOnce(showInformationMessageStub);
            sandbox.assert.calledOnce(mockApiCenterTreeItem.integrationsTreeItem.refresh as sinon.SinonStub);
        });

        it("should throw UserCancelledError when API Center selection is cancelled", async () => {
            // Arrange
            const treePickerStub = ext.treeDataProvider.showTreeItemPicker as sinon.SinonStub;
            treePickerStub.onFirstCall().throws(new UserCancelledError());

            // Act & Assert
            await assert.rejects(
                createIntegrationFromApim(mockContext, undefined),
                UserCancelledError
            );
        });
    });
});
