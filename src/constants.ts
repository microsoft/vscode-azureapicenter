// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { UiStrings } from './uiStrings';

export const extensionId = "apidev.azure-api-center";
export const extensionName = "azure-api-center";
export const extensionDisplayName = "Azure API Center";
export const chatParticipantId = "azure-api-center.apicenter";
export const sessionFolderKey = "currentSessionWorkingFolder";
export const showSavePromptConfigKey = "azure-api-center.showSavePrompt";
export const doubleClickDebounceDelay = 500; //milliseconds
export const selectedNodeKey = "selectedNode";
export const openapi = "openapi";
export const makrdownDocuments = "markdown-documents";
export const defaultRulesetFile = "https://raw.githubusercontent.com/Azure/APICenter-Analyzer/preview/resources/rulesets/oas.yaml";
export const azureApiGuidelineRulesetFile = "https://raw.githubusercontent.com/azure/azure-api-style-guide/main/spectral.yaml";
export const spectralOwaspRulesetFile = "https://unpkg.com/@stoplight/spectral-owasp-ruleset/dist/ruleset.mjs";
export const LearnMoreAboutAPICatalog = "https://aka.ms/LearnAboutAPICatalog";
export const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: 'copilot', family: 'gpt-4o' };
export const ExceedTokenLimit = "Message exceeds token limit";
export const SpectralExtensionId = "stoplight.spectral";
export const tenantSetting: string = 'tenant';
export const TeamsToolkitExtensionId = "TeamsDevApp.ms-teams-vscode-extension";
export const TeamsToolkitMinimumVersion = "5.13.2025021807";
export const DataPlaneAccountsKey = "azure-api-center.dataPlaneAccounts";
export const ContinueToSkip = UiStrings.ContinueToSkip;

export const AzureAccountType = {
    createAzureAccount: "azureapicenterCreateAzureAccount",
    createAzureStudentAccount: "azureapicenterCreateAzureStudentAccount",
};

export const AzureAccountCreateUrl = {
    createAzureAccountUrl: "https://aka.ms/VSCodeCreateAzureAccount",
    createAzureStudentUrl: "https://aka.ms/student-account"
};

export const RegisterApiOptions = {
    stepByStep: UiStrings.RegisterApiOptionStepByStep,
    cicd: UiStrings.RegisterApiOptionCicd
};

export const EnvironmentKind = {
    production: UiStrings.APICEnvironmentKindProduction,
    staging: UiStrings.APICEnvironmentKindStaging,
    development: UiStrings.APICEnvironmentKindDevelopment,
    testing: UiStrings.APICEnvironmentKindTestings,
};

export const TreeViewType = {
    controlPlaneView: UiStrings.APIControlPlaneView,
    dataPlaneView: UiStrings.APIDataPlaneView,
};

export const ApiRulesetOptions = {
    default: UiStrings.ApiRulesetOptionDefault,
    azureApiGuideline: UiStrings.ApiRulesetOptionAzureApiGuideline,
    spectralOwasp: UiStrings.ApiRulesetOptionSpectralOwasp,
    activeFile: UiStrings.ApiRulesetOptionActiveFile,
    selectFile: UiStrings.ApiRulesetOptionSelectFile,
    inputUrl: UiStrings.ApiRulesetOptionInputUrl,
    none: UiStrings.ApiRulesetOptionNone,
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

export const ApiCenterEnvironmentServerType = {
    AzureAPIManagement: UiStrings.AzureAPIManagement,
    AzureAppService: UiStrings.AzureAppService,
    AzureContainerApp: UiStrings.AzureContainerApps,
    AzureFunction: UiStrings.AzureFunction,
    AzureComputeService: UiStrings.AzureComputeService,
    ApigeeAPIM: UiStrings.ApigeeAPIM,
    AWSAPIManagement: UiStrings.AWSAPIGateway,
    KongAPIGateWay: UiStrings.KongAPIGateway,
    k8s: UiStrings.K8s,
    MuleAPIM: UiStrings.MuleSoftAPIM,
};
