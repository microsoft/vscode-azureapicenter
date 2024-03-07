# Azure API Center for Visual Studio Code

Build, discover, try, and consume APIs using your favorite development environment.

### Build

Make APIs you are building discoverable to others by registering them with API Center directly or using CI/CD pipelines in GitHub or Azure DevOps.

Shift-left API design conformance checks into Visual Studio Code with integrated linting support, powered by Spectral.

![linting](https://github.com/Azure/api-center-preview/assets/1091304/6e216651-1154-4bb3-bb9e-99b71b82a8be)

### Discover

Find the right API, fast from your organization's hand-crafted API catalog with API Center.

![tree-view](https://github.com/Azure/api-center-preview/assets/1050213/1ceac52f-33a3-4841-bfae-4090ff01807f)

Try our new integration with GitHub Copilot Chat to find APIs based on semantic search query.

![chat-agent](https://github.com/Azure/api-center-preview/assets/1050213/694bbe95-1602-40f2-8ae0-9694205069e4)

### Explore

Explore APIs without leaving Visual Studio Code with inline API documentation and interactive 'try it' experience.

![view-api-doc](https://github.com/Azure/api-center-preview/assets/1050213/fa91f080-52f5-4131-b7da-5bc035368b38)

Explore API requests and responses with automated .http file generation powered by the [REST Client extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

![generate-http-file](https://github.com/Azure/api-center-preview/assets/1050213/b5abd2ce-fdfd-437b-8a81-0f02c11e3f2a)

### Consume

Generate API SDK clients for your favorite language including JavaScript, TypeScript, .NET, Python, Java, and more, powered by the same [Microsoft Kiota](https://learn.microsoft.com/en-us/openapi/kiota/overview) engine that generates SDKs for Microsoft Graph, GitHub, and more.

![generate-api-client](https://github.com/Azure/api-center-preview/assets/1050213/2e0c1155-f36d-42c1-863b-1373c59a7750)

## Notice/Known Issues

- Contents in VS Code workspace are not sent to GitHub Copilot.
- When the content of single spec is very large, the `@apicenter` agent may fail as the token limit of GitHub Copilot Chat is exceeded. This is a temporary limitation our team is working to remove.
- When the number of selected Azure Subscription is larger then 10, `@apicenter` agent may fail as it reaches call limit of Azure REST APIs.

## Contributing

There are many ways in which you can participate in the project, for example:

- [Download our latest builds](https://github.com/microsoft/vscode-azureapicenter/releases).
- [Submit bugs and feature requests](https://github.com/microsoft/vscode-azureapicenter/issues), and help us verify as they are checked in
- Review [source code changes](https://github.com/microsoft/vscode-azureapicenter/pulls)
- Review the [documentation](CONTRIBUTING.md) and make pull requests for anything from typos to new content

## Telemetry

VS Code collects usage data and sends it to Microsoft to help improve our products and services. Read our [privacy statement](https://go.microsoft.com/fwlink/?LinkID=528096&clcid=0x409) to learn more. If you don’t wish to send usage data to Microsoft, you can set the `telemetry.enableTelemetry` setting to `false`. Learn more in our [FAQ](https://code.visualstudio.com/docs/supporting/faq#_how-to-disable-telemetry-reporting).


## Code of conduct

See [Microsoft Open Source code of conduct](https://opensource.microsoft.com/codeofconduct).

## Trademark

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow [Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/legal/intellectualproperty/trademarks/usage/general). Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party's policies.

## End User License Agreement
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the [EULA](EULA) license.

## License

Copyright (c) Microsoft Corporation. All rights reserved.

Licensed under the [MIT](LICENSE) license.
