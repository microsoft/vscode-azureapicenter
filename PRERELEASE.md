# Pre-release of Azure API Center for Visual Studio Code
## Changelog

> Note: This changelog only includes the changes for the pre-release versions of Azure API Center for Visual Studio Code. For the changelog of stable versions, please refer to the [Changelog of Azure API Center for Visual Studio Code](https://github.com/microsoft/vscode-azureapicenter/blob/main/CHANGELOG.md).

### November 4, 2024
* Add integration with GitHub Copilot for Azure (@Azure extension) to provide a chat experience for developers to leverage its capabilities for a variety of API Center-related tasks:
    * Generate OpenAPI specification compliant with the active API style guide.
    * If no active API style guide is set, generate OpenAPI specifications compliant with the default ‘spectral:oas’ ruleset.
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
