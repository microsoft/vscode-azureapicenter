// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as fs from 'fs';
import * as sinon from "sinon";
import { ApiCenterService } from "../../../../azure/ApiCenter/ApiCenterService";
import { ApiCenter, ApiCenterRulesetExport } from "../../../../azure/ApiCenter/contracts";
import { RulesTreeItem } from "../../../../tree/rules/RulesTreeItem";
import { zipFileBase64_multiFiles, zipFileBase64_noValidRuleFile } from "../../testConstants";
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
        if (rulesTreeItem && rulesTreeItem.rulesFolderPath) {
            fs.promises.rm(rulesTreeItem.rulesFolderPath, { recursive: true, force: true });
        }
        sandbox.restore();
    });
    it("multiple files in root rules folder", async () => {
        rulesTreeItem = new RulesTreeItem(
            {} as AzExtParentTreeItem,
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test",
                name: "testRulesTreeItem2",
            } as ApiCenter,
            true,
        );
        sandbox.stub(ApiCenterService.prototype, "exportRuleset").resolves({ value: zipFileBase64_multiFiles } as ApiCenterRulesetExport);

        let res = await rulesTreeItem.loadMoreChildrenImpl(false, {} as IActionContext);

        assert.equal(res.length, 2);
        assert.equal(res[0].commandId, "azure-api-center.openRule");
        assert.equal(res[0].contextValue, "azureApiCenterRule");
        assert.equal(res[1].contextValue, "azureApiCenterFunctions");

        assert.ok(fs.existsSync(path.join(rulesTreeItem.rulesFolderPath, "functions", "greeting.js")));
        assert.ok(fs.existsSync(path.join(rulesTreeItem.rulesFolderPath, "ruleset.yaml")));
    });
    it("no valid rule file in root rules folder", async () => {
        rulesTreeItem = new RulesTreeItem(
            {} as AzExtParentTreeItem,
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test",
                name: "testRulesTreeItem3",
            } as ApiCenter,
            true,
        );
        sandbox.stub(ApiCenterService.prototype, "exportRuleset").resolves({ value: zipFileBase64_noValidRuleFile } as ApiCenterRulesetExport);

        await assert.rejects(
            async () => {
                await rulesTreeItem.loadMoreChildrenImpl(false, {} as IActionContext);
            },
            {
                message: `No rule file ('ruleset.yml' or 'ruleset.yaml' or 'ruleset.json') found in the rules folder '${rulesTreeItem.getRulesFolderPath()}'. Please add a rule file to enable API Analysis.`,
            }
        );
    });
});
