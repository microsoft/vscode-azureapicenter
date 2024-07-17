// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { HttpOperationResponse } from "@azure/ms-rest-js";
import { AzExtParentTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ApiCenterService } from "../../../../azure/ApiCenter/ApiCenterService";
import { ApiCenter } from "../../../../azure/ApiCenter/contracts";
import { EnableRules } from "../../../../commands/rules/enableRules";
import { RulesTreeItem } from "../../../../tree/rules/RulesTreeItem";

describe("enableRules", () => {
    let sandbox: sinon.SinonSandbox;
    let node: RulesTreeItem;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        node = new RulesTreeItem(
            {} as AzExtParentTreeItem,
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test",
            } as ApiCenter,
            false,
        );
        sandbox.stub(node, "refresh").resolves();

    });
    afterEach(() => {
        sandbox.restore();
    });
    it('enable rules with status code 200', async () => {
        const showInformationMessage = sandbox.spy(vscode.window, "showInformationMessage");
        sandbox.stub(ApiCenterService.prototype, "createOrUpdateApiCenterRulesetConfig").resolves({ status: 200 } as HttpOperationResponse);
        await EnableRules.enableRules({} as IActionContext, node);
        sandbox.assert.calledOnce(showInformationMessage);
    });
    it('enable rules with no status code 200', async () => {
        const showErrorMessage = sandbox.spy(vscode.window, "showErrorMessage");
        sandbox.stub(ApiCenterService.prototype, "createOrUpdateApiCenterRulesetConfig").resolves({ status: 400 } as HttpOperationResponse);
        await EnableRules.enableRules({} as IActionContext, node);
        sandbox.assert.calledOnce(showErrorMessage);
    });
});
