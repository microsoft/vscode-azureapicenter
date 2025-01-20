// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import yaml from "js-yaml";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
const { Spectral } = require("@stoplight/spectral-core");
export default async function (output, context) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const text = output.match(/```yaml([\s\S]*?)```/)?.[1]?.trim();
    const yamlContent = yaml.dump(text, {
        indent: 2,
        noRefs: true,
        noCompatMode: true
    });
    const lines = yamlContent.split('\n');
    lines.shift();
    yamlFileContent = lines.join('\n');
    const ymlFileName = `spectral-` + Date.now() + ".yaml";
    const rulesetFilepath = path.join(__dirname, ymlFileName);
    const spectral = new Spectral();
    keywords = context.config.keywords;
    const kwSets = new Set();
    try {
        fs.writeFileSync(rulesetFilepath, yamlFileContent, 'utf8');
        spectral.setRuleset(await bundleAndLoadRuleset(rulesetFilepath, { fs, fetch }));
        const files = fs.readdirSync(path.join(__dirname, "apispec"));
        let componentRes = [];
        let isSuccess = false;
        for (const file of files) {
            const apiSpec = fs.readFileSync(path.join(__dirname, "apispec", file), "utf8");
            res = await spectral.run(apiSpec);
            if (res.length > 0) {
                for (item of res) {
                    msg = item.message;
                    if (msg && keywords.some(r => msg.includes(r))) {
                        kwSets.add(keywords.find(r => msg.includes(r)));
                        isSuccess = true;
                        let itemRes = {
                            pass: true,
                            score: 1,
                            reason: msg
                        }
                        componentRes.push(itemRes);
                    }
                }
            }
        }
        if (isSuccess) {
            return {
                pass: true,
                score: kwSets.size / keywords.length,
                reason: 'Get Success to the rules',
                componentResults: componentRes
            }
        }
        return {
            pass: false,
            score: 0,
            reason: 'No Any rules that set to this case',
        };
    } catch (err) {
        console.log('---------- err\n', err)
    }
    finally {
        fs.existsSync(rulesetFilepath) && fs.unlinkSync(rulesetFilepath);
    }
}
