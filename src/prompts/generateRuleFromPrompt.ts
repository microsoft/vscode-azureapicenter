// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export default function (context: any): string {
    return `You are an spectral spec rule designer, I hope you can accurately understand the constraints regarding the OpenAPI definition file in the next line, and consider the scope of application of this rule within the OpenAPI definition file, this scope is defined as \`given\` filed and is a valid regular expression match.
${context.vars.param1}
The following is a valid spectral rule example, \`\`\`yaml rules: \n  paths-kebab-case: \n    description: Paths should be kebab-case.\n message: "{{property}} should be kebab-case (lower-case and separated with hyphens)"\n severity: warn\n given: $.paths[*]~ \n then: \nfunction: pattern \n functionOptions: \n   match: "^(\/|[a-z0-9-.]+|{[a-zA-Z0-9_]+})+$"\`\`\`
there are some basic spectral rules that you must follow:
1. if function type is falsy, then there should not appear as "functionOptions".
2. if function type is schema, the functionOptions should define the schema object with required and properties.
3. description and message should be string with quota.
4. given path should be a valid regex.`;
}
