// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as fs from 'fs';
import * as sinon from "sinon";
import { ApiCenterService } from "../../../../azure/ApiCenter/ApiCenterService";
import { ApiCenter, ApiCenterRulesetExport } from "../../../../azure/ApiCenter/contracts";
import { RulesTreeItem } from "../../../../tree/rules/RulesTreeItem";
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
                name: "test",
            } as ApiCenter,
            true,
        );
        sandbox.stub(ApiCenterService.prototype, "exportRuleset").resolves({ value: "UEsDBAoAAAAAABp341gAAAAAAAAAAAAAAAAKAAAAZnVuY3Rpb25zL1BLAwQUAAgACAAad+NYAAAAAAAAAAAAAAAAEwAAAGZ1bmN0aW9ucy9lcXVhbHMuanNtkD9PwzAQxfdK/Q6PiKGVAuyugpiYEUOXqlJNcilGTuyezwhU5bujOM2fgeVk3f387r0zjXcsuKJk0kLv0VIgeY1tKca16FCza5C9BHHemvOnPAVPpbC2D6Vjynbr1XpFP0mkolpHK/9LbdYr4NoXwLQ+ikIbrc2HjvM9E9RIAPLrSSFzH19USpaPbV1Vpke1fWPnicVQUKi1DTQxfjGZ9IBvbSMpCMcZ7aYX0yUapkrhkCUyO95mAzPUjWg+k+y1zUfPWxTP45rStaE/ZhJAh2KE0plS9HqhgbuiGNjtbJRJIrc4zMYXGYCGQtBnUjjt05ImBgFdora4vyat7vGUzz/mhMfdLc8YZ7v7A1BLBwjYhjSrDQEAAP4BAABQSwMEFAAIAAgAGnfjWAAAAAAAAAAAAAAAAAsAAABydWxlc2V0LnltbF2OUQqEMBBD/wu9Qxj21z1AL+EZujJ1C3WqrRUW8e6LtiA4X5mE8OKKDKuPko1WQAdeig1Zq1QCV2/6dedzaWDinO3IBrTvnFJMx0E1Gf3GYkCvtxcXm7l+WVoTcI1lQBVDz6Sf7y31NhvKSbOfgbT6A1BLBwhHQAIHcgAAAK4AAABQSwECLQMKAAAAAAAad+NYAAAAAAAAAAAAAAAACgAAAAAAAAAAABAA7UEAAAAAZnVuY3Rpb25zL1BLAQItAxQACAAIABp341jYhjSrDQEAAP4BAAATAAAAAAAAAAAAIAC2gSgAAABmdW5jdGlvbnMvZXF1YWxzLmpzUEsBAi0DFAAIAAgAGnfjWEdAAgdyAAAArgAAAAsAAAAAAAAAAAAgALaBdgEAAHJ1bGVzZXQueW1sUEsFBgAAAAADAAMAsgAAACECAAAAAA==" } as ApiCenterRulesetExport);

        let res = await rulesTreeItem.loadMoreChildrenImpl(false, {} as IActionContext);

        assert.equal(res.length, 2);
        assert.equal(res[0].commandId, "azure-api-center.openRule");
        assert.equal(res[0].contextValue, "azureApiCenterRule");
        assert.equal(res[1].contextValue, "azureApiCenterFunctions");

        assert.ok(fs.existsSync(path.join(rulesTreeItem.rulesFolderPath, "functions", "equals.js")));
        assert.ok(fs.existsSync(path.join(rulesTreeItem.rulesFolderPath, "ruleset.yml")));
    });
});
