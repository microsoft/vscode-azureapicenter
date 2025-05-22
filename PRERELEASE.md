# Pre-release of Azure API Center for Visual Studio Code
## Changelog

> Note: This changelog only includes the changes for the pre-release versions of Azure API Center for Visual Studio Code. For the changelog of stable versions, please refer to the [Changelog of Azure API Center for Visual Studio Code](https://github.com/microsoft/vscode-azureapicenter/blob/main/CHANGELOG.md).

### May 22, 2025
* **API Center Portal Permission Scope Update**: Update the permission scope of the data plane API in API Center Portal View.

### May 14, 2025
* **Language Model Tools for API Center Data Plane APIs**: Added 5 language model tools to help developers easily discover and consume APIs registered in API Center with GitHub Copilot agent mode.

### April 24, 2025
* **Generate OpenAPI Specification**: Added functionality to generate an OpenAPI specification from the entire code project.
* **'Open in Azure Portal' Command**: Introduced a new command that allows users to open their API Center directly in the Azure Portal.
* **Rebranding**: Rebranded the 'Platform API Catalog' to 'API Center Portal View'.
* **Tree View for API Authentication**: Implemented a new tree view for API authentication and added 'Get Credential' command to get API credentials from API Authentication to get API access.
* **Generate HTTP File with API Key**: Introduced the ability to generate an HTTP file that includes the API key from API authentication. This enhancement facilitates easier testing and integration of APIs.
* **'Get Spectral Rules' Language Model Tool**: Added a language model tool to help generate compliant OpenAPI specifications by providing spectral rules. This tool ensures that the generated specifications adhere to industry standards.
* **'Copy Runtime URL' Command**: Added a command to copy the deployment URL from the deployment. This feature makes it more convenient to share and access deployment URLs.
* **'Create API Center Service in Azure' Command**: Introduced a new command to create a new API Center service in Azure.

### February 27, 2025
* Integrate with the `Teams Toolkit` extension to empower developers to create M365 Copilot Declarative Agents using API definitions from API Center.

### January 15, 2025
* Add support for API Analysis Profiles
* Add 'None' option to unselect active style guide

### November 4, 2024
* Add integration with GitHub Copilot for Azure (@Azure extension) to provide a chat experience for developers to leverage its capabilities for a variety of API Center-related tasks:
    * Generate OpenAPI specification compliant with the active API style guide.
    * If no active API style guide is set, generate OpenAPI specifications compliant with the default 'spectral:oas' ruleset.
    * Easily register your generated APIs in API Center.
* Add wiki guide for Platform API Catalog.

### September 26, 2024
* Add Platform API Catalog to Azure API Center:
    * Connect to An Existing API Center from UI, Command Palette or DeepLink
    * View and List all the APIs, Versions, Definitions
    * Export API, Generate API Client, Generate Markdown, OpenAPI Document from API Definitions
    * Sign In and Sign Out from Platform API Catalog
    * Disconnect to Platform API Catalog
    * Search APIs from Platform API Catalog

### August 19, 2024

* Manage API Analysis for Azure API Center:
    * Enable API Analysis
    * View and edit linting rules
    * Create, rename and delete JavaScript Custom Functions
    * Live linting for OpenAPI documentation to test linting rules
    * Sync linting rules to local
    * Deploy linting rules to Azure API Center
* Generating OpenAPI specification from an API code: use `gpt-4o` model to increase performance.
* Set active API Style Guide: support to select active file.

### July 16, 2024

* Generating Markdown documentation for an API: We have added a new command in the tree view of API definition called "Generate Markdown" to allow developers to easily generate markdown documentation.
* Generating OpenAPI specification from an API code: Developers now can right click on any API code and invoke the "Generate API Documentation" menu (under "Copilot" menu) to generate OpenAPI specification document when provided with API code.
* Deprecation of Azure account extension
