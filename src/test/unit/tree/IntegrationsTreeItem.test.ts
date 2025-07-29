// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { ApiCenter, ApiCenterApiSource } from "../../../azure/ApiCenter/contracts";
import { TelemetryClient } from "../../../common/telemetryClient";
import { IntegrationTreeItem } from "../../../tree/IntegrationTreeItem";
import { IntegrationsTreeItem } from "../../../tree/IntegrationsTreeItem";

describe("IntegrationsTreeItem test cases", () => {
    let sandbox: sinon.SinonSandbox;
    let integrationsTreeItem: IntegrationsTreeItem;
    let mockParent: AzExtParentTreeItem;
    let mockApiCenter: ApiCenter;
    let mockApiCenterService: sinon.SinonStubbedInstance<ApiCenterService>;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        sandbox.stub(TelemetryClient, "initialize").resolves();
        sandbox.stub(TelemetryClient, "sendEvent").returns();
        sandbox.stub(TelemetryClient, "sendErrorEvent").returns();

        // Mock parent tree item
        mockParent = {
            subscription: {
                subscriptionId: "test-subscription-id",
                tenantId: "test-tenant-id"
            }
        } as AzExtParentTreeItem;

        // Mock API Center
        mockApiCenter = {
            id: "/subscriptions/test-subscription-id/resourceGroups/test-rg/providers/Microsoft.ApiCenter/services/test-api-center",
            name: "test-api-center",
            location: "East US",
            resourceGroup: "test-rg",
            properties: {
                dataApiHostname: "test.data.api.center",
                portalHostname: "test.portal.api.center"
            },
            provisioningState: "Succeeded",
            sku: {
                name: "Free"
            },
            type: "Microsoft.ApiCenter/services"
        };

        integrationsTreeItem = new IntegrationsTreeItem(mockParent, mockApiCenter);

        // Mock ApiCenterService
        mockApiCenterService = sandbox.createStubInstance(ApiCenterService);
        sandbox.stub(ApiCenterService.prototype, "getApiCenterIntegrations").callsFake(mockApiCenterService.getApiCenterIntegrations);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("Constructor", () => {
        it("should initialize with correct properties", () => {
            assert.strictEqual(integrationsTreeItem.contextValue, "azureApiCenterIntegrations");
            assert.strictEqual(integrationsTreeItem.apiCenter, mockApiCenter);
            assert.strictEqual(integrationsTreeItem.parent, mockParent);
        });
    });

    describe("label", () => {
        it("should return correct label", () => {
            const label = integrationsTreeItem.label;
            assert.strictEqual(typeof label, "string");
            assert.ok(label.length > 0);
        });
    });

    describe("iconPath", () => {
        it("should return link theme icon", () => {
            const iconPath = integrationsTreeItem.iconPath;
            assert.ok(iconPath instanceof vscode.ThemeIcon);
            assert.strictEqual((iconPath as vscode.ThemeIcon).id, "link");
        });
    });

    describe("loadMoreChildrenImpl", () => {
        it("should load integrations successfully", async () => {
            const mockIntegrations: ApiCenterApiSource[] = [
                {
                    id: "integration-1",
                    name: "Test Integration 1",
                    type: "Microsoft.ApiCenter/services/apiSources",
                    properties: {
                        apiSourceType: "azureApiManagement",
                        apimSource: {
                            resourceId: "/subscriptions/test/resourceGroups/test/providers/Microsoft.ApiManagement/service/test-apim",
                            msiResourceId: "/subscriptions/test/resourceGroups/test/providers/Microsoft.ManagedIdentity/userAssignedIdentities/test-identity"
                        },
                        azureApiManagementSource: {
                            resourceId: "/subscriptions/test/resourceGroups/test/providers/Microsoft.ApiManagement/service/test-apim",
                            msiResourceId: "/subscriptions/test/resourceGroups/test/providers/Microsoft.ManagedIdentity/userAssignedIdentities/test-identity"
                        },
                        sourceLifecycleStage: "production",
                        targetEnvironmentId: "env-1",
                        targetLifecycleStage: "production",
                        importSpecification: "all",
                        linkState: {
                            state: "linked",
                            lastUpdatedOn: "2024-01-01T00:00:00Z"
                        }
                    },
                    systemData: {
                        createdAt: "2024-01-01T00:00:00Z",
                        lastModifiedAt: "2024-01-01T00:00:00Z"
                    }
                },
                {
                    id: "integration-2",
                    name: "Test Integration 2",
                    type: "Microsoft.ApiCenter/services/apiSources",
                    properties: {
                        apiSourceType: "azureApiManagement",
                        apimSource: {
                            resourceId: "/subscriptions/test/resourceGroups/test/providers/Microsoft.ApiManagement/service/test-apim-2",
                            msiResourceId: "/subscriptions/test/resourceGroups/test/providers/Microsoft.ManagedIdentity/userAssignedIdentities/test-identity-2"
                        },
                        azureApiManagementSource: {
                            resourceId: "/subscriptions/test/resourceGroups/test/providers/Microsoft.ApiManagement/service/test-apim-2",
                            msiResourceId: "/subscriptions/test/resourceGroups/test/providers/Microsoft.ManagedIdentity/userAssignedIdentities/test-identity-2"
                        },
                        sourceLifecycleStage: "development",
                        targetEnvironmentId: "env-2",
                        targetLifecycleStage: "development",
                        importSpecification: "selected",
                        linkState: {
                            state: "linking",
                            lastUpdatedOn: "2024-01-02T00:00:00Z"
                        }
                    },
                    systemData: {
                        createdAt: "2024-01-02T00:00:00Z",
                        lastModifiedAt: "2024-01-02T00:00:00Z"
                    }
                }
            ];

            mockApiCenterService.getApiCenterIntegrations.resolves({
                value: mockIntegrations,
                nextLink: ""
            });

            const context = {} as IActionContext;

            const children = await integrationsTreeItem.loadMoreChildrenImpl(false, context);

            assert.strictEqual(children.length, 2);
            assert.ok(children[0] instanceof IntegrationTreeItem);
            assert.ok(children[1] instanceof IntegrationTreeItem);
            assert.strictEqual((children[0] as IntegrationTreeItem).apiSource.name, "Test Integration 1");
            assert.strictEqual((children[1] as IntegrationTreeItem).apiSource.name, "Test Integration 2");
        });

        it("should handle empty integrations list", async () => {
            mockApiCenterService.getApiCenterIntegrations.resolves({
                value: [],
                nextLink: ""
            });

            const context = {} as IActionContext;

            const children = await integrationsTreeItem.loadMoreChildrenImpl(false, context);

            assert.strictEqual(children.length, 0);
        });

        it("should set nextLink when provided", async () => {
            const nextLink = "https://api.example.com/next";
            mockApiCenterService.getApiCenterIntegrations.resolves({
                value: [],
                nextLink: nextLink
            });

            const context = {} as IActionContext;

            await integrationsTreeItem.loadMoreChildrenImpl(false, context);

            assert.strictEqual(integrationsTreeItem.hasMoreChildrenImpl(), true);
        });

        it("should call ApiCenterService with correct parameters", async () => {
            mockApiCenterService.getApiCenterIntegrations.resolves({
                value: [],
                nextLink: ""
            });

            const context = {} as IActionContext;

            await integrationsTreeItem.loadMoreChildrenImpl(false, context);

            assert.ok(mockApiCenterService.getApiCenterIntegrations.calledOnce);
        });
    });

    describe("hasMoreChildrenImpl", () => {
        it("should return false when nextLink is undefined", () => {
            const hasMore = integrationsTreeItem.hasMoreChildrenImpl();
            assert.strictEqual(hasMore, false);
        });

        it("should return true when nextLink is set", async () => {
            mockApiCenterService.getApiCenterIntegrations.resolves({
                value: [],
                nextLink: "https://api.example.com/next"
            });

            const context = {} as IActionContext;

            await integrationsTreeItem.loadMoreChildrenImpl(false, context);
            const hasMore = integrationsTreeItem.hasMoreChildrenImpl();
            assert.strictEqual(hasMore, true);
        });
    });

    describe("Error handling", () => {
        it("should handle API service errors gracefully", async () => {
            const error = new Error("API service error");
            mockApiCenterService.getApiCenterIntegrations.rejects(error);

            const context = {} as IActionContext;

            try {
                await integrationsTreeItem.loadMoreChildrenImpl(false, context);
                assert.fail("Expected error to be thrown");
            } catch (thrownError) {
                assert.strictEqual(thrownError, error);
            }
        });
    });
});
