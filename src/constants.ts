// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { UiStrings } from './uiStrings';

export const extensionName = "azure-api-center";
export const sessionFolderKey = "currentSessionWorkingFolder";
export const showSavePromptConfigKey = "azure-api-center.showSavePrompt";
export const doubleClickDebounceDelay = 500; //milliseconds
export const selectedNodeKey = "selectedNode";
export const azureApiGuidelineRulesetFile = "https://raw.githubusercontent.com/azure/azure-api-style-guide/main/spectral.yaml";
export const spectralOwaspRulesetFile = "https://unpkg.com/@stoplight/spectral-owasp-ruleset/dist/ruleset.mjs";

export const RegisterApiOptions = {
    stepByStep: UiStrings.RegisterApiOptionStepByStep,
    cicd: UiStrings.RegisterApiOptionCicd,
};

export const ApiRulesetOptions = {
    azureApiGuideline: UiStrings.ApiRulesetOptionAzureApiGuideline,
    spectralOwasp: UiStrings.ApiRulesetOptionSpectralOwasp,
    selectFile: UiStrings.ApiRulesetOptionSelectFile,
    inputUrl: UiStrings.ApiRulesetOptionInputUrl,
};

export const CICDType = {
    github: UiStrings.CICDTypeGitHub,
    azure: UiStrings.CICDTypeAzure,
};

export const ApiSpecificationOptions = {
    apiCenter: UiStrings.ApiSpecificationOptionApiCenter,
    localFile: UiStrings.ApiSpecificationOptionLocalFile,
    activeEditor: UiStrings.ApiSpecificationOptionActiveEditor,
};
