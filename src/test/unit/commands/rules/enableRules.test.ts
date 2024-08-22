// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { HttpOperationResponse } from "@azure/ms-rest-js";
import { AzExtParentTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as path from 'path';
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ApiCenterService } from "../../../../azure/ApiCenter/ApiCenterService";
import { ApiCenter, ApiCenterRulesetImportResult } from "../../../../azure/ApiCenter/contracts";
import { enableRules } from "../../../../commands/rules/enableRules";
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
    it('enabling rules succeeded', async () => {
        sandbox.stub(path, 'join').returns(__dirname);
        const showInformationMessage = sandbox.spy(vscode.window, "showInformationMessage");
        sandbox.stub(ApiCenterService.prototype, "createOrUpdateApiCenterRulesetConfig").resolves({ status: 200 } as HttpOperationResponse);
        sandbox.stub(ApiCenterService.prototype, "importRuleset").resolves({ isSuccessful: true } as ApiCenterRulesetImportResult);
        await enableRules({} as IActionContext, node);
        sandbox.assert.calledOnce(showInformationMessage);
        assert.ok(node.isEnabled);
    });
    it('enabling rules failed when creating ruleset config', async () => {
        sandbox.stub(ApiCenterService.prototype, "createOrUpdateApiCenterRulesetConfig").resolves({ status: 400, bodyAsText: 'error' } as HttpOperationResponse);

        await assert.rejects(
            async () => {
                await enableRules({} as IActionContext, node);
            },
            {
                message: "Failed to enable API Analysis. Error: error",
            }
        );
        assert.ok(!node.isEnabled);
    });
    it('enabling rules failed when importing ruleset', async () => {
        sandbox.stub(path, 'join').returns(__dirname);
        sandbox.stub(ApiCenterService.prototype, "createOrUpdateApiCenterRulesetConfig").resolves({ status: 200 } as HttpOperationResponse);
        sandbox.stub(ApiCenterService.prototype, "importRuleset").resolves({ isSuccessful: false, message: 'error' } as ApiCenterRulesetImportResult);

        await assert.rejects(
            async () => {
                await enableRules({} as IActionContext, node);
            },
            {
                message: "Failed to enable API Analysis. Error: error",
            }
        );
        assert.ok(!node.isEnabled);
    });
});
