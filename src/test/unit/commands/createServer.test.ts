// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext, ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from "sinon";
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../../../azure/ApiCenter/contracts";
import { AzureApiCenterService } from "../../../commands/createApiCenterService";
import { SubscriptionTreeItem } from "../../../tree/SubscriptionTreeItem";
import { GeneralUtils } from "../../../utils/generalUtils";
describe("createApiCenterService", () => {
    let sandbox: sinon.SinonSandbox;
    let mockNode: SubscriptionTreeItem;
    let nodeRefreshStub: sinon.SinonStub;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        nodeRefreshStub = sandbox.stub().resolves();
        mockNode = {
            refresh: nodeRefreshStub,
        } as unknown as SubscriptionTreeItem;
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("confrimServerStatusWithRetry success", async () => {
        const apiCenterService = new ApiCenterService({} as ISubscriptionContext, "testServer", "testServer");
        const mockResponse1 = { id: "fakeId", name: "fakeName", provisioningState: "provisioning" } as ApiCenter;
        const mockResponse2 = {
            id: "fakeId", name: "fakeName", provisioningState: "Succeeded"
        } as ApiCenter;
        sandbox.stub(GeneralUtils, "sleep").resolves();
        const sendRequestStub = sandbox.stub(apiCenterService, "getApiCenter");
        sendRequestStub.onFirstCall().resolves(mockResponse1);
        sendRequestStub.onSecondCall().resolves(mockResponse2);
        await AzureApiCenterService.confrimServerStatusWithRetry(apiCenterService, mockNode, {} as IActionContext);
        assert.strictEqual(nodeRefreshStub.calledOnce, true);
    });
    it("confirmServerStatusWithRetry failed", async () => {
        const apiCenterService = new ApiCenterService({} as ISubscriptionContext, "testServer", "testServer");
        const mockResponse = { id: "fakeId", name: "fakeName", provisioningState: "provisioning" } as ApiCenter;
        sandbox.stub(GeneralUtils, "sleep").resolves();
        const sendRequestStub = sandbox.stub(apiCenterService, "getApiCenter");
        sendRequestStub.onFirstCall().resolves(mockResponse);
        await AzureApiCenterService.confrimServerStatusWithRetry(apiCenterService, mockNode, {} as IActionContext);
        assert.strictEqual(nodeRefreshStub.notCalled, true);
    });
});
