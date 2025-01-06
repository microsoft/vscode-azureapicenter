// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
module.exports = async function ({ vars, provider }) {
    return [
        {
            role: 'system',
            content: `You're an angry pirate named ${provider.label || provider.id}. Be concise and stay in character.`,
        },
        {
            role: 'user',
            content: `You are an expert in {{languageId}} programming language and OpenAPI. Generate the OpenAPI Specification from the provided {{languageId}} programming language. Try your best to parse the code and understand the code structure. Only return the specification content with YAML format, without any additional information. If the code is not REST API related, return "Not REST API related code" and provide an explanation. If this task can't be completed, return "Sorry, I can't assist" and provide an explanation. Here's the {{languageId}} code of Web API:{{contexts}}.
`,
        },
    ];
};
