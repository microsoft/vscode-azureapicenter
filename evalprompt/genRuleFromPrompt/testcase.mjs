// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
const { Spectral, Document } = require("@stoplight/spectral-core")
import { alphabetical, casing, defined, enumeration, falsy, length, pattern, schema, truthy, unreferencedReusableObject, xor } from "@stoplight/spectral-functions";
import { Yaml } from "@stoplight/spectral-parsers";
import yaml from "js-yaml";
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
    const yamlContent = output.match(/```yaml([\s\S]*?)```/)?.[1]?.trim();
    const ymlObjs = yaml.load(yamlContent);
    for (let ymlObj in ymlObjs.rules) {
        let obj = ymlObjs.rules[ymlObj];
        if (obj.then) {
            let thenObj = obj.then;
            if (thenObj.function && thenObj.function in valueMap) {
                thenObj.function = valueMap[thenObj.function];
            }
        }
    }

    const spectral = new Spectral();
    spectral.setRuleset(ymlObjs);
    keywords = context.config.keywords;
    const componentsRes = [];
    let isSuccess = false;
    const files = fs.readdirSync(path.join(__dirname, "apispec"));
    for (let file of files) {
        const myDocument = new Document(
            fs.readFileSync(path.join(__dirname, "apispec", file), "utf8"),
            Yaml
        );
        const res = await spectral.run(myDocument);
        for (let item of res) {
            if (keywords.some(r => item.message.includes(r))) {
                isSuccess = true;
                componentsRes.push({
                    pass: true,
                    score: 1,
                    reason: `Hit the critical field ${keywords} in ${item.message} from file ${file}`,
                });
            } else {
                componentsRes.push({
                    pass: false,
                    score: 0,
                    reason: `No critical field was hit with in ${item.message} from file ${file}`,
                });
            }
        }
    }
    const passCount = componentsRes.filter(item => item.pass).length;
    if (isSuccess) {
        return {
            pass: true,
            score: passCount / componentsRes.length,
            reason: `Hit the critical field ${keywords}`,
            componentResults: componentsRes
        }
    }
    return {
        pass: false,
        score: 0,
        reason: `No critical field was hit with ${keywords}`,
        componentsRes: componentsRes
    }
}
