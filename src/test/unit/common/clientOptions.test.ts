// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as assert from "assert";
import { clientOptions } from "../../../common/clientOptions";

describe("clientOptions", () => {
    it("user agent", () => {
        assert.ok(typeof clientOptions.userAgent === 'function');
        assert.strictEqual(clientOptions.userAgent("fakeDefaultUserAgent"), "vscode-azure-api-center fakeDefaultUserAgent");
    });
});
