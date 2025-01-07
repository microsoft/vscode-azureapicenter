const { Spectral } = require("@stoplight/spectral-core")
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import { fetch } from "@stoplight/spectral-runtime";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export default async function (output, context) {
    text = output.replace(/^```yaml.*\n/, '');
    text = text.replace(/\n```$/, '');
    const spectral = new Spectral();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const rulesetFilepath = path.join(__dirname, "spectral.yml");
    spectral.setRuleset(await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }));

    await spectral.run(text);
    return {
        pass: true,
        score: 0.5,
        reason: 'Contains banana',
    };
}
