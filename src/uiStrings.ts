// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from "vscode";

export class UiStrings {
    static readonly ApiTitle = vscode.l10n.t("API Title");
    static readonly ApiType = vscode.l10n.t("API Type");
    static readonly ApiVersionTitle = vscode.l10n.t("API Version Title");
    static readonly ApiVersionLifecycle = vscode.l10n.t("API Version Lifecycle");
    static readonly ApiDefinitionTitle = vscode.l10n.t("API Definition Title");
    static readonly ApiSpecificationName = vscode.l10n.t("API Specification Name");
    static readonly SelectFile = vscode.l10n.t("Select File");
    static readonly SelectApiDefinitionFile = vscode.l10n.t("Select API Definition File To Import");
    static readonly Import = vscode.l10n.t("Import");
    static readonly RegisterApi = vscode.l10n.t("Register API");
    static readonly CreatingApi = vscode.l10n.t("Creating API...");
    static readonly CreatingApiVersion = vscode.l10n.t("Creating API Version...");
    static readonly CreatingApiVersionDefinition = vscode.l10n.t("Creating API Version Definition...");
    static readonly ImportingApiDefinition = vscode.l10n.t("Importing API Definition...");
    static readonly ApiIsRegistered = vscode.l10n.t("API is registered.");
    static readonly FailedToRegisterApi = vscode.l10n.t("Failed to register API.");
    static readonly ValueNotBeEmpty = vscode.l10n.t("The value should not be empty.");
    static readonly ValueAtLeast2Char = vscode.l10n.t("The value should have at least 2 characters of numbers or letters.");
    static readonly ValueStartWithAlphanumeric = vscode.l10n.t("The value should start with letter or number.");
    static readonly OpenWorkspace = vscode.l10n.t("Open a workspace in Visual Studio Code to generate a CI/CD pipeline.");
    static readonly SelectCiCdProvider = vscode.l10n.t("Select CI/CD Provider");
    static readonly NoKiotaExtension = vscode.l10n.t("Please install the Kiota extension to generate the API library.");
    static readonly NoRestClientExtension = vscode.l10n.t("Please install the REST Client extension to test APIs with HTTP file.");
    static readonly NoSpectralExtension = vscode.l10n.t("Please install the Spectral extension to lint APIs.");
    static readonly SetApiStyleGuide = vscode.l10n.t("Set API Style Guide");
    static readonly SelectRulesetFile = vscode.l10n.t("Select Ruleset File");
    static readonly Ruleset = vscode.l10n.t("Ruleset");
    static readonly RemoteUrlRuleset = vscode.l10n.t('Remote URL of Ruleset File');
    static readonly ValidUrlStart = vscode.l10n.t('Please enter a valid URL.');
    static readonly ValidUrlType = vscode.l10n.t('Please enter a valid URL to a JSON, YAML or JavaScript file.');
    static readonly RulesetFileSet = vscode.l10n.t("API Style Guide is set to '{0}'.");
    static readonly CopilotNoCmd = vscode.l10n.t("Hi! What can I help you with? Please use `/list` or `/find` to chat with me!");
    static readonly CopilotQueryData = vscode.l10n.t("Querying data from Azure API Center...");
    static readonly CopilotNoMoreApiSpec = vscode.l10n.t("⚠️ There are no more API Specifications.");
    static readonly CopilotParseApiSpec = vscode.l10n.t("Parsing API Specifications...");
    static readonly CopilotParseApiSpecFor = vscode.l10n.t("Parsing API Specifications for '{0}'...");
    static readonly CopilotExceedsTokenLimit = vscode.l10n.t("⚠️ The content of API Spec exceeds the token limit of Copilot Chat LLM. Please try with below action.");
    static readonly RegisterApiOptionStepByStep = vscode.l10n.t("Step by step");
    static readonly RegisterApiOptionCicd = vscode.l10n.t("CI/CD");
    static readonly ApiRulesetOptionAzureApiGuideline = vscode.l10n.t("Microsoft Azure REST API");
    static readonly ApiRulesetOptionSpectralOwasp = vscode.l10n.t("OWASP API Security Top 10");
    static readonly ApiRulesetOptionSelectFile = vscode.l10n.t("Select Local File");
    static readonly ApiRulesetOptionInputUrl = vscode.l10n.t("Input Remote URL");
    static readonly CICDTypeGitHub = vscode.l10n.t("GitHub");
    static readonly CICDTypeAzure = vscode.l10n.t("Azure DevOps");
    static readonly TreeitemLabelApi = vscode.l10n.t("Apis");
    static readonly TreeitemLabelDefinitions = vscode.l10n.t("Definitions");
    static readonly TreeitemLabelVersions = vscode.l10n.t("Versions");
    static readonly TreeitemLabelEnvironments = vscode.l10n.t("Environments");
}
