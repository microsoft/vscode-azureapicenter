// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.


const fs = require("fs");
const path = require("path");

const bundlePath = path.join(__dirname, "..", "dist", "extension.js");
const MARKER =
    '"registerUIExtensionVariables" must be called before using the @microsoft/vscode-azext-utils package';

if (!fs.existsSync(bundlePath)) {
    console.error(
        `verify-bundle: bundle not found at ${bundlePath}. Run "npm run package" first.`
    );
    process.exit(1);
}

const bundle = fs.readFileSync(bundlePath, "utf8");
const occurrences = bundle.split(MARKER).length - 1;

if (occurrences > 1) {
    console.error(
        `verify-bundle: FAILED. Found ${occurrences} copies of @microsoft/vscode-azext-utils ` +
            `in dist/extension.js (dual-package hazard). Expected at most 1.\n` +
            `Check resolve.conditionNames in webpack.config.js.`
    );
    process.exit(1);
}

console.log(
    `verify-bundle: OK. Single @microsoft/vscode-azext-utils instance in the bundle (markers found: ${occurrences}).`
);
