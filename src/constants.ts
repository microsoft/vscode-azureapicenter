export const extensionName = "azure-api-center";
export const sessionFolderKey = "currentSessionWorkingFolder";
export const showSavePromptConfigKey = "azure-api-center.showSavePrompt";
export const doubleClickDebounceDelay = 500; //milliseconds
export const selectedNodeKey = "selectedNode";

export enum RegisterApiOptions {
    stepByStep = "Step by step",
    cicd = "CI/CD",
}

export enum CICDType {
    github = "GitHub",
    azure = "Azure DevOps",
}
