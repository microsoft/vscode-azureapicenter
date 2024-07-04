# Changelog

> Note: This changelog only includes the changes for the stable versions of Azure API Center for Visual Studio Code. For the changelog of pre-released versions, please refer to the [Pre-release Changelog of Azure API Center for Visual Studio Code](https://github.com/microsoft/vscode-azureapicenter/blob/main/PRERELEASE.md).

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
