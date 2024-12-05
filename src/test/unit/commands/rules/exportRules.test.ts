// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as fs from 'fs';
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ApiCenterService } from "../../../../azure/ApiCenter/ApiCenterService";
import { ApiCenter, ApiCenterRulesetExport } from "../../../../azure/ApiCenter/contracts";
import { exportRules } from "../../../../commands/rules/exportRules";
import { RulesTreeItem } from "../../../../tree/rules/RulesTreeItem";
import { zipFileBase64 } from "../../testConstants";
import path = require("path");

describe("exportRules", () => {
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
                name: "testExportRules",
            } as ApiCenter,
            "fakeConfigName",
        );
        sandbox.stub(node, "refresh").resolves();
    });
    afterEach(() => {
        sandbox.restore();
        fs.promises.rm(node.getRulesFolderPath(), { recursive: true, force: true });
    });
    it('export rules without existing files', async () => {
        const showInformationMessage = sandbox.spy(vscode.window, "showInformationMessage");
        sandbox.stub(ApiCenterService.prototype, "exportRuleset").resolves({ value: zipFileBase64 } as ApiCenterRulesetExport);

        await exportRules({} as IActionContext, node);

        sandbox.assert.calledOnce(showInformationMessage);
        assert.ok(fs.existsSync(path.join(node.getRulesFolderPath(), "functions", "equals.js")));
        assert.ok(fs.existsSync(path.join(node.getRulesFolderPath(), "ruleset.yml")));
    });
    it('export rules with existing files', async () => {
        const showInformationMessage = sandbox.spy(vscode.window, "showInformationMessage");
        const showWarningMessageStub = sandbox.stub(vscode.window, "showWarningMessage");
        showWarningMessageStub.callsFake((message: string, options: vscode.MessageOptions, ...items: any[]) => {
            return Promise.resolve(undefined);
        });

        sandbox.stub(ApiCenterService.prototype, "exportRuleset").resolves({ value: zipFileBase64 } as ApiCenterRulesetExport);

        await fs.promises.mkdir(node.getRulesFolderPath(), { recursive: true });
        await fs.promises.writeFile(path.join(node.getRulesFolderPath(), "test.txt"), "test");

        await exportRules({} as IActionContext, node);

        sandbox.assert.calledOnce(showWarningMessageStub);
        sandbox.assert.notCalled(showInformationMessage);
    });
});
