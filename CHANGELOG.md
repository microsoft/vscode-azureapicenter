# Changelog

> Note: This changelog only includes the changes for the stable versions of Azure API Center for Visual Studio Code. For the changelog of pre-released versions, please refer to the [Pre-release Changelog of Azure API Center for Visual Studio Code](https://github.com/microsoft/vscode-azureapicenter/blob/main/PRERELEASE.md).

## 1.3.0
* **'Edit API Specification Document' Command**: Added a command to edit and upload API spec.
* **'Create new integration with Azure API Management' Command**: Added a command to sync APIs from APIM, also a new 'Integrations' tree node to list all the integrations.
* **'Register MCP (Preview)' Command**: Added a command to register MCP Server.
* **'Create API Environment' Command**: Added a command to create new API Environment.
* Added 'Environments' and 'Deployments' tree node in 'API Center Portal View'.
* 'Generate OpenAPI Spec from Current File' and 'Generate OpenAPI Spec from Entire Project' commands are moved to 'Azure API Center' submenu from 'Copilot' submenu.

## 1.2.0
* **Language Model Tools for API Center Data Plane APIs**: Added 5 language model tools to help developers easily discover and consume APIs registered in API Center with GitHub Copilot agent mode.
* **Generate OpenAPI Specification**: Added functionality to generate an OpenAPI specification from the entire code project.
* **'Open in Azure Portal' Command**: Introduced a new command that allows users to open their API Center directly in the Azure Portal.
* **Rebranding**: Rebranded the 'Platform API Catalog' to 'API Center Portal View'.
* [Preview] **Tree View for API Authentication**: Implemented a new tree view for API authentication and added 'Get Credential' command to get API credentials from API Authentication to get API access.
* [Preview] **Generate HTTP File with API Key**: Introduced the ability to generate an HTTP file that includes the API key from API authentication. This enhancement facilitates easier testing and integration of APIs.
* **'Get Spectral Rules' Language Model Tool**: Added a language model tool to help generate compliant OpenAPI specifications by providing spectral rules. This tool ensures that the generated specifications adhere to industry standards.
* **'Copy Runtime URL' Command**: Added a command to copy the deployment URL from the deployment. This feature makes it more convenient to share and access deployment URLs.
* **'Create API Center Service in Azure' Command**: Introduced a new command to create a new API Center service in Azure.
* Integrate with the `Microsoft 365 Agents Toolkit` extension to empower developers to create M365 Copilot Declarative Agents using API definitions from API Center.
* [Preview] Manage API Analysis for Azure API Center:
    * View API Analysis Profiles
    * View and edit linting rules
    * Create, rename and delete JavaScript Custom Functions
    * Live linting for OpenAPI documentation to test linting rules
    * Sync linting rules to local
    * Deploy linting rules to Azure API Center
* Add 'None' option to unselect active style guide

## 1.0.1
* Deprecation of Azure account extension
* Add integration with GitHub Copilot for Azure (@Azure extension) to provide a chat experience for developers to leverage its capabilities for a variety of API Center-related tasks:
    * Generate OpenAPI specification compliant with the active API style guide.
    * If no active API style guide is set, generate OpenAPI specifications compliant with the default ‘spectral:oas’ ruleset.
    * Easily register your generated APIs in API Center.
* Add Platform API Catalog to Azure API Center:
    * Connect to An Existing API Center from UI, Command Palette or DeepLink
    * View and List all the APIs, Versions, Definitions
    * Export API, Generate API Client, Generate Markdown, OpenAPI Document from API Definitions
    * Sign In and Sign Out from Platform API Catalog
    * Disconnect to Platform API Catalog
    * Search APIs from Platform API Catalog
    * Wiki guide for Platform API Catalog.
* Set active API Style Guide: support to select active file.
* Generating Markdown documentation for an API: We have added a new command in the tree view of API definition called "Generate Markdown" to allow developers to easily generate markdown documentation.
* Generating OpenAPI specification from an API code:
    * Developers now can right click on any API code and invoke the "Generate API Documentation" menu (under "Copilot" menu) to generate OpenAPI specification document based on current file.
    * Use `gpt-4o` model to increase performance.

## 1.0.0

The 1.0.0 general availability (GA) release of the Azure API Center extension for Visual Studio Code provides new capabilities such as the ability to export API specification, defining default rules for API linting and displaying new strings in tree view

### Features

- Allows exporting of the API specification document
- Defines default ruleset for API linting
- New icons/strings in tree view
- Improvement for .http file generation

## 0.3.0

The 0.3.0 release of the Azure API Center extension for Visual Studio Code introduces new functionality to detect breaking changes between two OpenAPI specification documents and improves API discoverability by adding the ability to search for an API in the tree view.

### Features

- Search for APIs within an API Center from the tree view.
- Detect breaking changes between two OpenAPI specification documents. Breaking changes are shown in the `Problems` view and directly within the editor.

## 0.2.0

The 0.2.0 release of the Azure API Center extension for Visual Studio Code introduces new functionality to register APIs with API Center and shift-left API design conformance checks into Visual Studio Code as you build out APIs. It also includes bug fixes for APIs imported from Azure API Management to ensure APIs titles are properly displayed and interactable using the tree view.

### Features

- Register APIs with API Center manually, or by adding a preconfigured CI/CD pipeline for GitHub or Azure DevOps to your project.
- Check design conformance with organizational API style guides (powered by Spectral). OpenAPI and AsyncAPI are supported specification types.

## 0.1.0

This is the first release (!) of the Azure API Center extension for Visual Studio Code. The API Center extension enables you to discover, try, and consume APIs directly from the environment you know best: Visual Studio Code. Developers can also use our brand new integration with GitHub Copilot to find the right APIs for their scenario based on semantic meaning with Copilot Chat.

### Features

- Browse Azure API Centers and the APIs, deployments, and environments available in each with a tree-based user interface
- Open interactive API documentation with "try it" functionality (powered by Swagger UI)
- Try APIs with .HTTP files using the `REST Client` extension
- Generate API SDK clients for your favorite language including JavaScript, TypeScript, .NET, Python, Java, and more  (powered by Microsoft Kiota)
- Find the right API for your scenario with semantic search in GitHub Copilot Chat that knows all about the APIs you and your team have access to (powered by API Center)
