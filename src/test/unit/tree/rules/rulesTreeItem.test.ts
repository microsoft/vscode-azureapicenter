// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as fs from 'fs';
import * as sinon from "sinon";
import { ApiCenterService } from "../../../../azure/ApiCenter/ApiCenterService";
import { ApiCenter, ApiCenterRulesetExport } from "../../../../azure/ApiCenter/contracts";
import { RulesTreeItem } from "../../../../tree/rules/RulesTreeItem";
import { zipFileBase64 } from "../../testConstants";
import path = require("path");

describe("rulesTreeItem", () => {
    let sandbox: sinon.SinonSandbox;
    let rulesTreeItem: RulesTreeItem;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
    });
    afterEach(() => {
        sandbox.restore();
        if (rulesTreeItem && rulesTreeItem.rulesFolderPath) {
            fs.promises.rm(rulesTreeItem.rulesFolderPath, { recursive: true, force: true });
        }
    });
    it("rulesTreeItem not enabled ", async () => {
        rulesTreeItem = new RulesTreeItem(
            {} as AzExtParentTreeItem,
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test",
            } as ApiCenter,
            false,
        );

        let res = await rulesTreeItem.loadMoreChildrenImpl(false, {} as IActionContext);

        assert.equal(res.length, 1);
        assert.equal(res[0].commandId, "azure-api-center.enableRules");
        assert.equal(res[0].contextValue, "enableRules");
    });
    it("rulesTreeItem enabled ", async () => {
        rulesTreeItem = new RulesTreeItem(
            {} as AzExtParentTreeItem,
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test",
                name: "testRulesTreeItem",
            } as ApiCenter,
            true,
        );
        sandbox.stub(ApiCenterService.prototype, "exportRuleset").resolves({ value: zipFileBase64 } as ApiCenterRulesetExport);

        let res = await rulesTreeItem.loadMoreChildrenImpl(false, {} as IActionContext);

        assert.equal(res.length, 2);
        assert.equal(res[0].commandId, "azure-api-center.openRule");
        assert.equal(res[0].contextValue, "azureApiCenterRule");
        assert.equal(res[1].contextValue, "azureApiCenterFunctions");

        assert.ok(fs.existsSync(path.join(rulesTreeItem.rulesFolderPath, "functions", "equals.js")));
        assert.ok(fs.existsSync(path.join(rulesTreeItem.rulesFolderPath, "ruleset.yml")));
    });
});
