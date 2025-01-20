import pkg from '@stoplight/spectral-core';
import { bundleAndLoadRuleset } from "@stoplight/spectral-ruleset-bundler/with-loader";
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "path";
const { Spectral, Document } = pkg;
// this will be our API specification document
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rule = fs.readFileSync(path.join(__dirname, "evalprompt", "genRuleFromPrompt", "test", "1.yaml"), "utf8");
const fse = {
    promises: {
        async readFile(filepath) {
            if (filepath === "/.spectral.yaml") {
                return rule;
            }

            throw new Error(`Could not read ${filepath}`);
        },
    },
};
const spectral = new Spectral();
spectral.setRuleset(await bundleAndLoadRuleset("/.spectral.yaml", { fse, fetch }));

const myDocument = fs.readFileSync(path.join(__dirname, "evalprompt", "genRuleFromPrompt", "apispec", "petstore.yaml"), "utf8");
// // we lint our document using the ruleset we passed to the Spectral object
spectral.run(myDocument).then(console.log);
