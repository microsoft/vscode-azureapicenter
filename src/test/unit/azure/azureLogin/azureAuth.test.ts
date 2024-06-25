// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import { AzureAuth } from "../../../../azure/azureLogin/azureAuth";
suite("azureLogin azureAuth File", () => {
    let sandbox = null as any;
    suiteSetup(() => {
        sandbox = sinon.createSandbox();
    });
    teardown(() => {
        sandbox.restore();
    });
    test("getDefaultScope endpoint", async () => {
        let endpoint = "https://localhost/com";
        let res = AzureAuth.getDefaultScope(endpoint);
        assert.strictEqual(res, "https://localhost/com/.default");
        endpoint = endpoint + '/';
        res = AzureAuth.getDefaultScope(endpoint);
        assert.strictEqual(res, "https://localhost/com/.default");
    });
})
