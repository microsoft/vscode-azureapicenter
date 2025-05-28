// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export default function (context: any): string {
    return `You are an expert in ${context.vars.languageId} programming language and OpenAPI.
Generate the OpenAPI Specification from the provided ${context.vars.languageId} programming language.
Try your best to parse the code and understand the code structure.
Only return the specification content with YAML format, without any additional information.
If the code is not REST API related, return "Not REST API related code" and provide an explanation.
If this task can't be completed, return "Sorry, I can't assist" and provide an explanation.
Here's the ${context.vars.languageId} code of Web API:
\`\`\`
${context.vars.codeContent}
\`\`\``;
};
