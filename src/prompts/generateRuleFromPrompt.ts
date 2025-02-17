// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export default function (context: any): string {
    return `You are an expert in Spectral rules, please help generate the ruleset meet with following requirement: ${context.vars.userprompt}.
When responding, please follow these requirements and do not return repetitive content:
1.  **Analyze the User Requirement:**  Carefully analyze the user's requirement (\` ${context.vars.userprompt} \`) to identify the key aspects of the API specification that need to be validated.  Consider aspects like:
    *   Data types and formats
    *   Naming conventions
    *   Required fields
    *   API design patterns (e.g., RESTful principles)
    *   Security considerations
2.  **Identify Relevant Spectral Concepts:** Based on your analysis, identify the Spectral concepts (e.g., \`rules\`, \`given\`, \`then\`, \`severity\`, functions like \`pattern\`, \`schema\`, \`truthy\`, etc.) that are most appropriate for implementing the required validation. Refer to the Spectral documentation (https://docs.stoplight.io/docs/spectral/d3482ff0ccae9-rules) as needed.
3.  **Construct the Spectral Rule(s):**  For each identified validation requirement, construct a Spectral rule in YAML format.  Each rule should include:
    *   A descriptive \`name\`
    *   A \`given\` path that specifies the part of the API specification to be evaluated.
    *   A \`then\` block that defines the validation logic.
    *   A \`severity\` level (e.g., \`warn\`, \`error\`, \`info\`, \`hint\`).
    *   No need to extends the spectral:oas ruleset.
4.  **Explain the Rule Logic (Chain-of-Thought):** For *each* rule you create, provide a clear and concise explanation of *why* you chose that particular rule structure, \`given\` path, \`then\` logic, and \`severity\`.  Specifically:
    *   Explain how the \`given\` path targets the correct element(s) in the API specification.
    *   Explain how the \`then\` logic enforces the user's requirement.  Reference specific Spectral functions or concepts used (e.g., "I used the \`pattern\` function to ensure that the field matches the specified regular expression.").
    *   Justify the chosen \`severity\` level.
5.  **Present the Final YAML Ruleset:** After explaining all the rules, provide a complete, valid YAML ruleset containing all the generated rules.  The YAML should be well-formatted and ready to use with Spectral.
`;
};
