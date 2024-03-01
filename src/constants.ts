export const extensionName = "azure-api-center";
export const sessionFolderKey = "currentSessionWorkingFolder";
export const showSavePromptConfigKey = "azure-api-center.showSavePrompt";
export const doubleClickDebounceDelay = 500; //milliseconds
export const selectedNodeKey = "selectedNode";
export const azureApiGuidelineRulesetFile = "https://raw.githubusercontent.com/azure/azure-api-style-guide/main/spectral.yaml";
export const spectralOwaspRulesetFile = "https://unpkg.com/@stoplight/spectral-owasp-ruleset/dist/ruleset.mjs";

export enum RegisterApiOptions {
    stepByStep = "Step by step",
    cicd = "CI/CD",
}

export enum ApiRulesetOptions {
    azureApiGuideline = "Microsoft Azure REST API",
    spectralOwasp = "OWASP API Security Top 10",
    selectFile = "Select Local File",
    inputUrl = "Input Remote URL",
}

export enum CICDType {
    github = "GitHub",
    azure = "Azure DevOps",
}
