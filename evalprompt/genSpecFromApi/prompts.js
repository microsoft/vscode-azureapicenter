// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
const path = require('path');
const { readFileSync } = require('fs');
module.exports = async function (context) {
    const srcPath = path.join(__dirname, 'src', `${context.vars.file}`);
    const contexts = readFileSync(srcPath, 'utf8');
    return [
        {
            role: 'user',
            content: `You are an expert in ${context.vars.languageId} programming language and OpenAPI. Generate the OpenAPI Specification from the provided ${context.vars.languageId} programming language. Try your best to parse the code and understand the code structure. Only return the specification content with YAML format, without any additional information. If the code is not REST API related, return "Not REST API related code" and provide an explanation. If this task can't be completed, return "Sorry, I can't assist" and provide an explanation. Here's the ${context.vars.languageId} code of Web API:${contexts}.`,
        },
    ];
};
