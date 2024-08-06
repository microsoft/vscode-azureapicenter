// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from "sinon";
import { ApiCenterService } from "../../../../azure/ApiCenter/ApiCenterService";
import { ApiCenterRulesetImport } from "../../../../azure/ApiCenter/contracts";

describe("ApiCenterService", () => {
    let sandbox: sinon.SinonSandbox;
    let subscriptionContext: ISubscriptionContext;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        subscriptionContext = {
            credentials: {
                getToken: sandbox.stub().resolves({ token: 'fake-token' })
            }
        } as unknown as ISubscriptionContext;
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("importRuleset", async () => {
        const apiCenterService = new ApiCenterService(subscriptionContext, "fakeResourceGroup", "fakeServiceName");

        const importPayload: ApiCenterRulesetImport = {
            value: "fakeValue",
            format: "InlineZip",
        };
        const response = await apiCenterService.importRuleset(importPayload);
        console.log("response: " + JSON.stringify(response));
    });
});
