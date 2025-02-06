const { Spectral, Document } = require("@stoplight/spectral-core")
import { alphabetical, casing, defined, enumeration, falsy, length, pattern, schema, truthy, unreferencedReusableObject, xor } from "@stoplight/spectral-functions";
import { Yaml } from "@stoplight/spectral-parsers";
import yaml from 'js-yaml';
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
export default async function (output, context) {
    const valueMap = {
        alphabetical: alphabetical,
        casing: casing,
        defined: defined,
        enumeration: enumeration,
        falsy: falsy,
        length: length,
        pattern: pattern,
        schema: schema,
        truthy: truthy,
        unreferencedReusableObject: unreferencedReusableObject,
        xor: xor
    };
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const ruleYaml = output.match(/```yaml([\s\S]*?)```/)?.[1]?.trim();
    const rule = yaml.load(ruleYaml);
    for (let ymlObj in rule.rules) {
        let obj = rule.rules[ymlObj];
        if (obj.then) {
            let thenObj = obj.then;
            if (thenObj.function && thenObj.function in valueMap) {
                thenObj.function = valueMap[thenObj.function];
            }
        }
    }
    const spectral = new Spectral();
    spectral.setRuleset(rule);
    hits = context.config.hits;
    const componentsRes = [];
    let hitCount = 0;
    for (let hit in hits) {
        const file = hit;
        hitCount += hits[hit].length;
        const myDocument = new Document(
            fs.readFileSync(path.join(__dirname, "apispec", file), "utf-8").trim(),
            Yaml,
            "openapi.yaml",
        );
        let res = await spectral.run(myDocument);
        let hitArr = hits[hit];
        for (let item of res) {
            let itemArr = item.path;
            if (hitArr.some(r => JSON.stringify(r) === JSON.stringify(itemArr))) {
                componentsRes.push({
                    pass: true,
                    score: 1,
                    reason: `Hit the critical path ${itemArr} from file ${file}`,
                });
            } else {
                componentsRes.push({
                    pass: false,
                    score: 0,
                    reason: `Path ${itemArr} not expected from file ${file}`,
                });
            }
        }
    }
    const pCount = componentsRes.filter(item => item.pass).length;
    const totalCount = componentsRes.length;
    const npCount = totalCount - pCount;
    if (pCount != hitCount || hitCount != componentsRes.length) {
        return {
            pass: false,
            score: pCount > npCount ? (pCount - npCount) / hitCount : 0,
            reason: `Some paths are not expected from the files`,
            componentResults: componentsRes
        }
    }
    return {
        pass: true,
        score: 1,
        reason: `All rules meets requirements`,
        componentResults: componentsRes
    }
}
