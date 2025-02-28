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
    static readonly NoKiotaExtension = vscode.l10n.t("Please install the Microsoft Kiota extension to generate an API library.");
    static readonly NoRestClientExtension = vscode.l10n.t("Please install the REST Client extension to test APIs with a HTTP file.");
    static readonly NoSpectralExtension = vscode.l10n.t("Please install the Spectral extension to lint APIs.");
    static readonly SetApiStyleGuide = vscode.l10n.t("Set API Style Guide");
    static readonly SelectRulesetFile = vscode.l10n.t("Select Ruleset File");
    static readonly Ruleset = vscode.l10n.t("Ruleset");
    static readonly RemoteUrlRuleset = vscode.l10n.t('Remote URL of Ruleset File');
    static readonly ValidUrlStart = vscode.l10n.t('Please enter a valid URL.');
    static readonly ValidUrlType = vscode.l10n.t('Please enter a valid URL to a JSON, YAML, or JavaScript file.');
    static readonly RulesetFileSet = vscode.l10n.t("API Style Guide is set to '{0}'.");
    static readonly RulesetFileSetAsNone = vscode.l10n.t("API Style Guide is set as none.");
    static readonly CopilotNoCmd = vscode.l10n.t("Hi! What can I help you with? Please use `/list` or `/find` to chat with me!");
    static readonly CopilotQueryData = vscode.l10n.t("Querying data from Azure API Center...");
    static readonly CopilotNoMoreApiSpec = vscode.l10n.t("⚠️ There are no more API specification documents.");
    static readonly CopilotParseApiSpec = vscode.l10n.t("Parsing API Specifications...");
    static readonly CopilotParseApiSpecFor = vscode.l10n.t("Parsing API Specifications for '{0}'...");
    static readonly CopilotExceedsTokenLimit = vscode.l10n.t("The size of the current file is large for GitHub Copilot. Please try again with a file of smaller size.");
    static readonly RegisterApiOptionStepByStep = vscode.l10n.t("Manual");
    static readonly RegisterApiOptionCicd = vscode.l10n.t("CI/CD");
    static readonly ApiRulesetOptionDefault = vscode.l10n.t("Default");
    static readonly ApiRulesetOptionAzureApiGuideline = vscode.l10n.t("Microsoft Azure REST API");
    static readonly ApiRulesetOptionSpectralOwasp = vscode.l10n.t("OWASP API Security Top 10");
    static readonly ApiRulesetOptionActiveFile = vscode.l10n.t("Active File");
    static readonly ApiRulesetOptionSelectFile = vscode.l10n.t("Select Local File...");
    static readonly ApiRulesetOptionInputUrl = vscode.l10n.t("Input Remote URL...");
    static readonly ApiRulesetOptionNone = vscode.l10n.t("None");
    static readonly CICDTypeGitHub = vscode.l10n.t("GitHub");
    static readonly CICDTypeAzure = vscode.l10n.t("Azure DevOps");
    static readonly ApiSpecificationOptionApiCenter = vscode.l10n.t("Azure API Center");
    static readonly ApiSpecificationOptionLocalFile = vscode.l10n.t("Local File");
    static readonly ApiSpecificationOptionActiveEditor = vscode.l10n.t("Active Editor");
    static readonly TreeitemLabelApis = vscode.l10n.t("APIs");
    static readonly TreeitemLabelDefinitions = vscode.l10n.t("Definitions");
    static readonly TreeitemLabelVersions = vscode.l10n.t("Versions");
    static readonly TreeitemLabelEnvironments = vscode.l10n.t("Environments");
    static readonly AccountTreeItemChildTypeLabel = vscode.l10n.t("Subscription");
    static readonly SubscriptionTreeItemChildTypeLabel = vscode.l10n.t("API Center Service");
    static readonly ApiCenterTreeItemTreeItemChildTypeLabel = vscode.l10n.t("APIs or Environments");
    static readonly ApisTreeItemChildTypeLabel = vscode.l10n.t("API");
    static readonly ApiTreeItemChildTypeLabel = vscode.l10n.t("Deployments or Versions");
    static readonly ApiVersionsChildTypeLabel = vscode.l10n.t("API Version");
    static readonly ApiVersionChildTypeLabel = vscode.l10n.t("Definitions");
    static readonly ApiVersionDefinitionsTreeItemChildTypeLabel = vscode.l10n.t("API Definition");
    static readonly NoFolderOpened = vscode.l10n.t("No folder is opened. Please open a folder to use this feature.");
    static readonly NoNodeInstalled = vscode.l10n.t("Node.js is not installed. Please install Node.js to use this feature.");
    static readonly SelectFirstApiSpecification = vscode.l10n.t("Select first API specification document");
    static readonly SelectSecondApiSpecification = vscode.l10n.t("Select second API specification document");
    static readonly SelectApiSpecification = vscode.l10n.t("Select API specification document");
    static readonly OpticTaskName = vscode.l10n.t("Breaking Change Detection");
    static readonly OpticTaskSource = vscode.l10n.t("Azure API Center");
    static readonly SearchAPI = vscode.l10n.t('Search API');
    static readonly SearchAPIsResult = vscode.l10n.t("Search Result for '{0}'");
    static readonly SearchContentHint = vscode.l10n.t("Search for API name, kind, lifecycle stage");
    static readonly AIContentIncorrect = vscode.l10n.t("AI-generated content may be incorrect");
    static readonly NoActiveFileOpen = vscode.l10n.t("No active file is open.");
    static readonly GeneratingOpenAPI = vscode.l10n.t("Generating OpenAPI Specification from Current File...");
    static readonly SelectTenantBeforeSignIn = vscode.l10n.t("You must sign in before selecting a tenant.");
    static readonly NoTenantSelected = vscode.l10n.t("No tenant selected.");
    static readonly NoSubscriptionsFoundAndSetup = vscode.l10n.t("No subscriptions were found. Set up your account if you have yet to do so.");
    static readonly SetUpAzureAccount = vscode.l10n.t("Set up Account");
    static readonly SelectSubscription = vscode.l10n.t("Select Subscriptions");
    static readonly Loading = vscode.l10n.t("Loading...");
    static readonly SignIntoAzure = vscode.l10n.t("Sign in to Azure...");
    static readonly WaitForAzureSignIn = vscode.l10n.t("Waiting for Azure sign-in...");
    static readonly SelectTenant = vscode.l10n.t("Select tenant...");
    static readonly ErrorAuthenticating = vscode.l10n.t("Error authenticating");
    static readonly ErrorLoadingSubscriptions = vscode.l10n.t("Error loading subscriptions");
    static readonly NoSubscriptionsFound = vscode.l10n.t("No subscriptions found");
    static readonly AzureAccount = vscode.l10n.t("Azure");
    static readonly CreateAzureAccount = vscode.l10n.t("Create an Azure Account...");
    static readonly CreateAzureStudentAccount = vscode.l10n.t("Create an Azure for Students Account...");
    static readonly WaitForSignIn = vscode.l10n.t("Waiting for sign-in");
    static readonly SelectATenant = vscode.l10n.t("Select a tenant");
    static readonly NoMSAuthSessionFound = vscode.l10n.t("No Microsoft authentication session found: {0}");
    static readonly CustomCloudChoiseNotConfigured = vscode.l10n.t("The custom cloud choice is not configured. Please configure the setting {0}.{1}.");
    static readonly FailedToListGroup = vscode.l10n.t("Failed to list resources: {0}");
    static readonly NotSignInStatus = vscode.l10n.t("Not signed in {0}");
    static readonly NoTenantFound = vscode.l10n.t("No tenants found.");
    static readonly NoAzureSessionFound = vscode.l10n.t("No Azure session found.");
    static readonly FailedTo = vscode.l10n.t("Failed to retrieve Azure session: {0}");
    static readonly SelectSubscriptions = vscode.l10n.t("Select Subscriptions...");
    static readonly InputCustomFunctionName = vscode.l10n.t("Please provide the name of a custom function.");
    static readonly DeleteCustomFunction = vscode.l10n.t("Are you sure you want to delete '{0}'?");
    static readonly FileAlreadyExists = vscode.l10n.t("The file '{0}' already exists. Please input a different name.");
    static readonly NoRulesFolder = vscode.l10n.t("Rules folder '{0}' is empty. No files to deploy.");
    static readonly DeployRules = vscode.l10n.t("Deploying Rules...");
    static readonly RulesDeployed = vscode.l10n.t("Rules deployed to '{0}'.");
    static readonly FailedToDeployRules = vscode.l10n.t("Failed to deploy rules. {0}");
    static readonly RulesFolderNotEmpty = vscode.l10n.t("The rules folder '{0}' is not empty. Do you want to overwrite the existing files?");
    static readonly Yes = vscode.l10n.t("Yes");
    static readonly No = vscode.l10n.t("No");
    static readonly NoRulesExported = vscode.l10n.t("No Rules to export.");
    static readonly RulesExported = vscode.l10n.t("Rules exported to '{0}'.");
    static readonly TreeitemLabelFunctions = vscode.l10n.t("Functions");
    static readonly TreeitemLabelProfiles = vscode.l10n.t("Profiles");
    static readonly OpenApiCenterFolder = vscode.l10n.t("Rules folder is required to be opened to enable live API linting. Click 'Yes' to open the rules folder in current window.");
    static readonly NoRuleFileFound = vscode.l10n.t("No rule file ('{0}') found in the rules folder '{1}'. Please add a rule file to enable API Analysis.");
    static readonly AddDataPlaneRuntimeUrl = vscode.l10n.t("Input Runtime URL");
    static readonly AddDataPlaneClientId = vscode.l10n.t("Input Entra App Client ID");
    static readonly AddDataPlaneTenantId = vscode.l10n.t("Input Entra App Tenant ID");
    static readonly RequestFailedWithStatusCode = vscode.l10n.t("Request failed with status code: {0}");
    static readonly DownloadDefinitionFileWithErrorMsg = vscode.l10n.t("Download API Center Definition File error: {0}");
    static readonly DatplaneAlreadyAdded = vscode.l10n.t("This Data Plane Runtime URL already added to Data View.");
    static readonly SelectItemFromTreeView = vscode.l10n.t("Select from which tree view");
    static readonly GetTreeView = vscode.l10n.t("Please connect to Azure API Center Service first.");
    static readonly APIControlPlaneView = vscode.l10n.t("API Center Management Plane");
    static readonly APIDataPlaneView = vscode.l10n.t("API Center Data Plane");
    static readonly APIDataPlaneWiki = vscode.l10n.t("API Catalog Guide");
    static readonly GenerateOpenApiProgress = vscode.l10n.t("Invoking Azure API Center plugin to generate OpenAPI specification documentation...");
    static readonly GenerateOpenApiRegisterApiDesc = vscode.l10n.t("\n\nAzure API Center is a centralized hub for discovering, reusing, and governing all of your organization's APIs. Would you like to register your API in Azure API Center?");
    static readonly GenerateOpenApiRegisterApiButton = vscode.l10n.t("Register your API in API Center");
    static readonly GenerateOpenApiViewApiDesc = vscode.l10n.t("\n\nWould you like to see a list of all the APIs available in your API Center?");
    static readonly GenerateOpenApiViewApiButton = vscode.l10n.t("Show Azure API Center");
    static readonly GenerateOpenApiSetRuleDesc = vscode.l10n.t("\n\nWould you like to analyze your API definitions for compliance with an API style guide?");
    static readonly GenerateOpenApiSetRuleButton = vscode.l10n.t("Set active API style guide");
    static readonly GenerateOpenApiRegenerateDesc = vscode.l10n.t("\n\nAfter your API style guide is set, you could regenerate the API specification again.");
    static readonly GenerateOpenApiRegenerateButton = vscode.l10n.t("Regenerate API specification");
    static readonly NoTeamsToolkitExtension = vscode.l10n.t("Please install the Teams Toolkit extension with minimum version '{0}'.");
    static readonly ActivatingTeamsToolkit = vscode.l10n.t("Activating Teams Toolkit");
    static readonly ExportingApiDefinition = vscode.l10n.t("Exporting API Definition");
    static readonly ResourceGroupName = vscode.l10n.t("Resource Group");
    static readonly ApiCenterServiceLocation = vscode.l10n.t("Location");
    static readonly ApiCenterService = vscode.l10n.t("API Center Service");
    static readonly CreatingApiCenterService = vscode.l10n.t("Creating API Center Service");
    static readonly GetResourceGroup = vscode.l10n.t("Get Resource Group...");
    static readonly CreateResourceGroup = vscode.l10n.t("Create Resource Group...");
    static readonly FailedToCreateApiCenterService = vscode.l10n.t("Failed to Api Center Service.");
}
