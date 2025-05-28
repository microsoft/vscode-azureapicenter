// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import generateApiSpecFromPrompt, { spectralDefaultRuleDescriptions } from "../../src/prompts/generateApiSpecFromPrompt";

export default function (context: any): string {
    context.vars.ruleContent = spectralDefaultRuleDescriptions;
    return generateApiSpecFromPrompt(context);
}
