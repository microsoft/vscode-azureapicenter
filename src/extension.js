"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const telemetryClient_1 = require("./common/telemetryClient");
// Commands
// Copilot
// Tree View UI
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const editOpenApi_1 = require("./commands/editOpenApi");
const exportOpenApi_1 = require("./commands/exportOpenApi");
const generateApiLibrary_1 = require("./commands/generateApiLibrary");
const generateHttpFile_1 = require("./commands/generateHttpFile");
const importOpenApi_1 = require("./commands/importOpenApi");
const openApiInSwagger_1 = require("./commands/openApiInSwagger");
const refreshTree_1 = require("./commands/refreshTree");
const testInPostman_1 = require("./commands/testInPostman");
const constants_1 = require("./constants");
const extensionVariables_1 = require("./extensionVariables");
const AzureAccountTreeItem_1 = require("./tree/AzureAccountTreeItem");
const OpenApiEditor_1 = require("./tree/Editors/openApi/OpenApiEditor");
// Copilot Chat
const viewOpenApi_1 = require("./commands/viewOpenApi");
const telemetryEvent_1 = require("./common/telemetryEvent");
const copilotChat_1 = require("./copilot-chat/copilotChat");
async function activate(context) {
    console.log('Congratulations, your extension "azure-api-center" is now active!');
    await telemetryClient_1.TelemetryClient.initialize(context);
    telemetryClient_1.TelemetryClient.sendEvent('activate');
    // https://github.com/microsoft/vscode-azuretools/tree/main/azure
    extensionVariables_1.ext.context = context;
    extensionVariables_1.ext.outputChannel = (0, vscode_azext_utils_1.createAzExtOutputChannel)('Azure API Center', extensionVariables_1.ext.prefix);
    context.subscriptions.push(extensionVariables_1.ext.outputChannel);
    (0, vscode_azext_azureutils_1.registerAzureUtilsExtensionVariables)(extensionVariables_1.ext);
    const azureAccountTreeItem = new AzureAccountTreeItem_1.AzureAccountTreeItem();
    context.subscriptions.push(azureAccountTreeItem);
    extensionVariables_1.ext.treeItem = azureAccountTreeItem;
    // var a = ext.treeItem.subscription;
    const treeDataProvider = new vscode_azext_utils_1.AzExtTreeDataProvider(azureAccountTreeItem, "appService.loadMore");
    const treeView = vscode.window.createTreeView("apiCenterTreeView", { treeDataProvider });
    context.subscriptions.push(treeView);
    treeView.onDidChangeSelection((e) => {
        const selectedNode = e.selection[0];
        extensionVariables_1.ext.outputChannel.appendLine(selectedNode.id);
        extensionVariables_1.ext.context.globalState.update(constants_1.selectedNodeKey, selectedNode.id);
    });
    // Register API Center extension commands
    registerCommandWithTelemetry('azure-api-center.selectSubscriptions', () => vscode_1.commands.executeCommand('azure-account.selectSubscriptions'));
    // TODO: move all three to their separate files
    registerCommandWithTelemetry('azure-api-center.importOpenApiByFile', async (context, node) => { await (0, importOpenApi_1.importOpenApi)(context, node, false); });
    registerCommandWithTelemetry('azure-api-center.importOpenApiByLink', async (context, node) => { await (0, importOpenApi_1.importOpenApi)(context, node, true); });
    registerCommandWithTelemetry('azure-api-center.exportOpenApi', async (context, node) => { await (0, exportOpenApi_1.exportOpenApi)(context, node); });
    // TODO: move this to a separate file
    const openApiEditor = new OpenApiEditor_1.OpenApiEditor();
    context.subscriptions.push(openApiEditor);
    extensionVariables_1.ext.openApiEditor = openApiEditor;
    // TODO: move this to a separate file
    extensionVariables_1.ext.openApiEditor = openApiEditor;
    // registerEvent('azure-api-center.openApiEditor.onDidSaveTextDocument',
    //     vscode.workspace.onDidSaveTextDocument,
    //     async (actionContext: IActionContext, doc: vscode.TextDocument) => { await openApiEditor.onDidSaveTextDocument(actionContext, context.globalState, doc); });
    registerCommandWithTelemetry('azure-api-center.showOpenApi', editOpenApi_1.showOpenApi, constants_1.doubleClickDebounceDelay);
    registerCommandWithTelemetry('azure-api-center.viewOpenApi', viewOpenApi_1.viewOpenApi);
    registerCommandWithTelemetry('azure-api-center.open-api-docs', openApiInSwagger_1.openAPiInSwagger);
    registerCommandWithTelemetry('azure-api-center.open-postman', testInPostman_1.testInPostman);
    registerCommandWithTelemetry('azure-api-center.generate-api-client', generateApiLibrary_1.generateApiLibrary);
    registerCommandWithTelemetry('azure-api-center.generateHttpFile', generateHttpFile_1.generateHttpFile);
    registerCommandWithTelemetry('azure-api-center.apiCenterTreeView.refresh', async (context) => (0, refreshTree_1.refreshTree)(context));
    const agent = vscode.chat.createChatAgent('apicenter', copilotChat_1.handleChatMessage);
    agent.description = 'Build, discover, and consume great APIs.';
    agent.fullName = "Azure API Center";
    agent.slashCommandProvider = {
        provideSlashCommands(token) {
            return [
                {
                    name: 'list',
                    description: 'List available APIs.',
                },
                {
                    name: 'find',
                    description: 'Find an API given a search query.',
                }
            ];
        },
    };
    agent.followupProvider = {
        provideFollowups(result, token) {
            if (result.slashCommand === 'list') {
                return [{
                        message: '@apicenter /list $more',
                        title: 'List more APIs'
                    }];
            }
            else if (result.slashCommand === 'find') {
                return [{
                        message: '@apicenter /find $more',
                        title: 'Find in more APIs'
                    }];
            }
        }
    };
    context.subscriptions.push(agent);
}
exports.activate = activate;
async function registerCommandWithTelemetry(commandId, callback, debounce) {
    (0, vscode_azext_utils_1.registerCommand)(commandId, async (context, ...args) => {
        const start = Date.now();
        const properties = {};
        let parsedError;
        try {
            telemetryClient_1.TelemetryClient.sendEvent(`${commandId}.start`);
            await callback(context, ...args);
        }
        catch (error) {
            parsedError = (0, vscode_azext_utils_1.parseError)(error);
            throw error;
        }
        finally {
            const end = Date.now();
            properties[telemetryEvent_1.TelemetryProperties.duration] = ((end - start) / 1000).toString();
            if (parsedError) {
                properties[telemetryEvent_1.ErrorProperties.errorType] = parsedError.errorType;
                properties[telemetryEvent_1.ErrorProperties.errorMessage] = parsedError.message;
                telemetryClient_1.TelemetryClient.sendErrorEvent(`${commandId}.end`, properties);
            }
            else {
                telemetryClient_1.TelemetryClient.sendEvent(`${commandId}.end`, properties);
            }
        }
    }, debounce);
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map