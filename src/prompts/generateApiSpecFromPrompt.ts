// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export const spectralDefaultRuleDescriptions = `Operation must have at least one "2xx" or "3xx" response.
Every operation must have unique "operationId".
Operation parameters are unique and non-repeating.
Operation tags must be defined in global tags.
Path parameters must be defined and valid.
Contact object must have "name", "url" and "email".
Enum values must not have duplicate entry.
Info object must have "contact" object.
Info "description" must be present and non-empty string.
Info object must have "license" object.
License object must include "url".
Markdown descriptions must not have "eval(".
Markdown descriptions must not have "<script>" tags.
OpenAPI object must have alphabetical "tags".
Each tag must have a unique name.
OpenAPI object must have non-empty "tags" array.
Operation must have "description".
Operation must have "operationId".
operationId must not characters that are invalid when used in URL.
Operation must not have more than a single tag.
Operation must have non-empty "tags" array.
Path parameter declarations must not be empty, ex."/given/{}" is invalid.
Path must not end with slash.
Path must not include query string.
Tag object must have "description".
Schemas with "type: array", require a sibling "items" field
Enum values must respect the specified type.
OpenAPI "servers" must be present and non-empty array.
Examples must have either "value" or "externalValue" field.
Parameter objects must have "description".
Server URL must not point at example.com.
Server URL must not have trailing slash.
Examples must be valid against their defined schema.
Examples must be valid against their defined schema.
Validate structure of OpenAPI v3 specification.
Schemas defined in the components section must be used.
Examples defined in the components section must be used.
Server variables must be defined and valid and there must be no unused variables.
Callbacks should not be defined within a callback
Servers should not be defined in a webhook.
Callbacks should not be defined in a webhook.`;


export default function (context: any): string {
    return `Please be professional, and use below infomation to generate an OpenAPI specification documentation with YAML format:
${context.vars.userPrompt}
In addition, ignore previous rules in conversation history, and make sure the OpenAPI spec meet with below rules:
${context.vars.ruleContent}`;
};
