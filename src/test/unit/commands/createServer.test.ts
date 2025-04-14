// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext, ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { ApiCenter, SubServers } from "../../../azure/ApiCenter/contracts";
import { ResourceGraphService } from "../../../azure/ResourceGraph/ResourceGraphService";
import { AzureApiCenterService } from "../../../commands/createApiCenterService";
import { SubscriptionTreeItem } from "../../../tree/SubscriptionTreeItem";
import { GeneralUtils } from "../../../utils/generalUtils";
describe("createApiCenterService", () => {
    let sandbox: sinon.SinonSandbox;
    let mockNode: SubscriptionTreeItem;
    let nodeRefreshStub: sinon.SinonStub;
    let showQuickPickStub: sinon.SinonStub;
    let showInputBoxStub: sinon.SinonStub;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        nodeRefreshStub = sandbox.stub().resolves();
        mockNode = {
            subscriptionContext: {} as ISubscriptionContext,
            refresh: nodeRefreshStub,
        } as unknown as SubscriptionTreeItem;
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("confirmServerStatusWithRetry success", async () => {
        const mockResponse = {
            id: "fakeId", name: "fakeName", provisioningState: "Succeeded"
        } as ApiCenter;
        sandbox.stub(GeneralUtils, "sleep").resolves();
        const resStub = sandbox.stub(ResourceGraphService.prototype, "queryApiCenterByName");
        resStub.onFirstCall().resolves([]);
        resStub.onSecondCall().resolves([mockResponse]);
        await AzureApiCenterService.confirmServerStatusWithRetry("fakeName", mockNode, {} as IActionContext);
        assert.strictEqual(nodeRefreshStub.calledOnce, true);
    });
    it("confirmServerStatusWithRetry failed", async () => {
        const mockResponse = { id: "fakeId", name: "fakeName", provisioningState: "Succeeded" } as ApiCenter;
        sandbox.stub(GeneralUtils, "sleep").resolves();
        const resStub = sandbox.stub(ResourceGraphService.prototype, "queryApiCenterByName");
        resStub.onFirstCall().resolves([]);
        try {
            await AzureApiCenterService.confirmServerStatusWithRetry("fakeName", mockNode, {} as IActionContext);
        } catch (err) {
            assert.strictEqual((err as Error).message, "Creating API Center Service may take a long time. Please wait a moment, refresh the tree view and try again.");
        }
        assert.strictEqual(nodeRefreshStub.notCalled, true);
    });
    it("createApiCenterService success", async () => {
        showInputBoxStub = sinon.stub(vscode.window, "showInputBox").resolves("testServerName");
        showQuickPickStub = sinon.stub(vscode.window, "showQuickPick").resolves("US" as unknown as vscode.QuickPickItem);
        sinon.stub(ApiCenterService.prototype, "listApiCenterServers").resolves({ id: "fakeId", namespace: "fakeName", registrationPolicy: "fakeRP", registrationState: "fakeRS", resourceTypes: [{ apiVersions: ["fakeApiVersion"], capabilities: "fakeCap", locations: ["US", "UK"], resourceType: "services" }] } as SubServers);
        const iRGEStub = sinon.stub(ApiCenterService.prototype, "isResourceGroupExist").resolves(true);
        const courgStub = sinon.stub(ApiCenterService.prototype, "createOrUpdateApiCenterService").resolves({} as ApiCenter);
        const csswrStub = sinon.stub(AzureApiCenterService, "confirmServerStatusWithRetry").resolves();
        await AzureApiCenterService.createApiCenterService({} as IActionContext, mockNode);
        assert.strictEqual(iRGEStub.calledOnce, true);
        assert.strictEqual(courgStub.calledOnce, true);
        assert.strictEqual(csswrStub.calledOnce, true);
    });
});
