// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
const { Spectral } = require("@stoplight/spectral-core")
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import { fetch } from "@stoplight/spectral-runtime";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export default async function (output, context) {
    text = output.replace(/[\s\S]*?```yaml/, '');
    text = text.replace(/\n```$/, '');
    const spectral = new Spectral();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const rulesetFilepath = path.join(__dirname, "spectral.yml");
    spectral.setRuleset(await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }));
    res = await spectral.run(text);
    if (res.length > 0) {
        let components = [];
        let score = 0;
        for (item of res) {
            let itemRes = {
                pass: false,
                score: item.severity * 0.1,
                reason: item.message
            }
            components.push(itemRes);
        }
        return {
            pass: false,
            score: 1 / (components.length + 1),
            reason: 'fail the spectral rules',
            componentResults: components
        }
    }
    return {
        pass: true,
        score: 1,
        reason: 'Meet all the spectral rules',
    };
}
