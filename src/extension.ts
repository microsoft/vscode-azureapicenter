// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { TelemetryClient } from './common/telemetryClient';

// Commands
// Copilot

// Tree View UI
import { registerAzureUtilsExtensionVariables } from '@microsoft/vscode-azext-azureutils';
import { AzExtTreeDataProvider, AzExtTreeItem, CommandCallback, IActionContext, IParsedError, createAzExtOutputChannel, isUserCancelledError, parseError, registerCommand, registerEvent } from '@microsoft/vscode-azext-utils';
import { AzureAccount } from "./azure/azureLogin/azureAccount";
import { AzureSessionProviderHelper } from "./azure/azureLogin/azureSessionProvider";
import { AzureDataSessionProviderHelper } from "./azure/azureLogin/dataSessionProvider";
import { ConnectDataPlaneApi } from "./commands/addDataPlaneApis";
import { cleanupSearchResult } from './commands/cleanUpSearch';
import { CreateDeclarativeAgent } from './commands/createDeclarativeAgent';
import { detectBreakingChange } from './commands/detectBreakingChange';
import { showOpenApi } from './commands/editOpenApi';
import { ExportAPI } from './commands/exportApi';
import { AIFAgentGenerator } from './commands/generateAiFoundryAgent';
import { GenerateApiFromCode } from './commands/generateApiFromCode';
import { generateApiLibrary } from './commands/generateApiLibrary';
import { generateApiSpecFromCodeProject } from './commands/generateApiSpecFromCodeProject';
import { GenerateHttpFile } from './commands/generateHttpFile';
import { generateMarkdownDocument } from './commands/generateMarkdownDocument';
import { handleUri } from './commands/handleUri';
import { importOpenApi } from './commands/importOpenApi';
import { openAPiInSwagger } from './commands/openApiInSwagger';
import openInAzurePortal from './commands/openInAzurePortal';
import { openUrlFromTreeNode } from './commands/openUrl';
import { refreshTree } from './commands/refreshTree';
import { registerApi } from './commands/registerApi';
import { removeDataplaneAPI } from './commands/removeDataplaneApi';
import { addCustomFunction } from './commands/rules/addCustomFunction';
import { deleteCustomFunction } from './commands/rules/deleteCustomFunction';
import { deployRules } from './commands/rules/deployRules';
import { exportRules } from './commands/rules/exportRules';
import { openRule } from './commands/rules/openRule';
import { renameCustomFunction } from './commands/rules/renameCustomFunction';
import { searchApi } from './commands/searchApi';
import { SetApiRuleset } from './commands/setApiRuleset';
import { SignInToDataPlane } from "./commands/signInToDataPlane";
import { testInPostman } from './commands/testInPostman';
import { ErrorProperties, TelemetryProperties } from './common/telemetryEvent';
import { LearnMoreAboutAPICatalog, doubleClickDebounceDelay, selectedNodeKey } from './constants';
import { getPlugins } from './copilot/getPlugins';
import { ext } from './extensionVariables';
import { ApiVersionDefinitionTreeItem } from './tree/ApiVersionDefinitionTreeItem';
import { createAzureAccountTreeItem } from "./tree/AzureAccountTreeItem";
import { createAzureDataAccountTreeItem } from './tree/DataPlaneAccount';
import { OpenApiEditor } from './tree/Editors/openApi/OpenApiEditor';
import { TelemetryUtils } from './utils/telemetryUtils';
export async function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "azure-api-center" is now active!');

    await TelemetryClient.initialize(context);

    TelemetryClient.sendEvent('activate');

    // https://github.com/microsoft/vscode-azuretools/tree/main/azure
    ext.context = context;
    ext.outputChannel = createAzExtOutputChannel('Azure API Center', ext.prefix);
    context.subscriptions.push(ext.outputChannel);
    registerAzureUtilsExtensionVariables(ext);

    setupControlView(context);
    setupDataTreeView(context);

    // Register API Center extension commands

    // TODO: move all three to their separate files
    registerCommandWithTelemetry('azure-api-center.importOpenApiByFile', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await importOpenApi(context, node, false); });
    registerCommandWithTelemetry('azure-api-center.importOpenApiByLink', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await importOpenApi(context, node, true); });
    registerCommandWithTelemetry('azure-api-center.exportApi', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await ExportAPI.exportApi(context, node); });

    // TODO: move this to a separate file
    const openApiEditor: OpenApiEditor = new OpenApiEditor();
    context.subscriptions.push(openApiEditor);
    ext.openApiEditor = openApiEditor;

    // TODO: move this to a separate file
    ext.openApiEditor = openApiEditor;

    registerEvent('azure-api-center.openApiEditor.onDidSaveTextDocument',
        vscode.workspace.onDidSaveTextDocument,
        async (actionContext: IActionContext, doc: vscode.TextDocument) => { await openApiEditor.onDidSaveTextDocument(actionContext, context.globalState, doc); });

    registerCommandWithTelemetry('azure-api-center.showOpenApi', showOpenApi, doubleClickDebounceDelay);

    registerCommandWithTelemetry('azure-api-center.open-api-docs', openAPiInSwagger);

    registerCommandWithTelemetry('azure-api-center.open-postman', testInPostman);

    registerCommandWithTelemetry('azure-api-center.generate-api-client', generateApiLibrary);

    registerCommandWithTelemetry('azure-api-center.generateHttpFile', GenerateHttpFile.generateHttpFile);

    registerCommandWithTelemetry('azure-api-center.registerApi', registerApi);

    registerCommandWithTelemetry('azure-api-center.searchApi', searchApi);

    registerCommandWithTelemetry('azure-api-center.cleanupSearchResult', cleanupSearchResult);

    registerCommandWithTelemetry('azure-api-center.setApiRuleset', SetApiRuleset.setApiRuleset);

    registerCommandWithTelemetry('azure-api-center.generateApiFromCode', GenerateApiFromCode.generateApiFromCode);

    registerCommandWithTelemetry('azure-api-center.generateApiSpecFromCodeProject', generateApiSpecFromCodeProject);

    registerCommandWithTelemetry('azure-api-center.detectBreakingChange', detectBreakingChange);

    registerCommandWithTelemetry('azure-api-center.generateMarkdownDocument', generateMarkdownDocument);

    registerCommandWithTelemetry('azure-api-center.exportRules', exportRules);

    registerCommandWithTelemetry('azure-api-center.deployRules', deployRules);

    registerCommandWithTelemetry('azure-api-center.openRule', openRule);

    registerCommandWithTelemetry('azure-api-center.addCustomFunction', addCustomFunction);

    registerCommandWithTelemetry('azure-api-center.renameCustomFunction', renameCustomFunction);

    registerCommandWithTelemetry('azure-api-center.deleteCustomFunction', deleteCustomFunction);

    registerCommandWithTelemetry('azure-api-center.agent.getPlugins', getPlugins);

    registerCommandWithTelemetry('azure-api-center.apiCenterTreeView.refresh', async (context: IActionContext) => refreshTree(context));

    registerCommandWithTelemetry('azure-api-center.signInToAzure', AzureAccount.signInToAzure);
    registerCommandWithTelemetry('azure-api-center.selectTenant', AzureAccount.selectTenant);
    registerCommandWithTelemetry('azure-api-center.selectSubscriptions', AzureAccount.selectSubscriptions);
    registerCommandWithTelemetry('azure-api-center.openUrl', openUrlFromTreeNode);
    registerCommandWithTelemetry('azure-api-center.apiCenterWorkspace.signInToDataPlane', SignInToDataPlane);
    registerCommandWithTelemetry('azure-api-center.apiCenterWorkspace.refresh', async (context: IActionContext) => ext.dataPlaneTreeItem.refresh(context));
    registerCommandWithTelemetry('azure-api-center.apiCenterWorkspace.addApis', ConnectDataPlaneApi.addDataPlaneApis);
    registerCommandWithTelemetry('azure-api-center.apiCenterWorkspace.collapse', () => {
        vscode.commands.executeCommand('workbench.actions.treeView.apiCenterWorkspace.collapseAll');
    });

    registerCommandWithTelemetry('azure-api-center.apiCenterWorkspace.learnApiPortal', () => vscode.env.openExternal(vscode.Uri.parse(LearnMoreAboutAPICatalog)));

    registerCommandWithTelemetry('azure-api-center.apiCenterWorkspace.removeApi', removeDataplaneAPI);

    registerCommandWithTelemetry('azure-api-center.createDeclarativeAgent', CreateDeclarativeAgent.createDeclarativeAgent);

    registerCommandWithTelemetry('azure-api-center.openInPortal', openInAzurePortal);

    registerCommandWithTelemetry('azure-api-center.generate-ai-foundry-agent', AIFAgentGenerator.generateAIFAgent);

    context.subscriptions.push(
        vscode.window.registerUriHandler({
            handleUri
        })
    );
}

async function registerCommandWithTelemetry(commandId: string, callback: CommandCallback, debounce?: number): Promise<void> {
    registerCommand(commandId, async (context: IActionContext, ...args: any[]) => {
        const start: number = Date.now();
        const properties: { [key: string]: string; } = {};
        let parsedError: IParsedError | undefined;
        try {
            TelemetryClient.sendEvent(`${commandId}.start`);
            return await callback(context, ...args);
        } catch (error) {
            parsedError = parseError(error);
            if (!isUserCancelledError(parsedError)) {
                throw error;
            }
        } finally {
            const end: number = Date.now();
            properties[TelemetryProperties.duration] = ((end - start) / 1000).toString();
            TelemetryUtils.setAzureResourcesInfo(properties, args[0]);
            if (parsedError) {
                properties[ErrorProperties.errorType] = parsedError.errorType;
                properties[ErrorProperties.errorMessage] = parsedError.message;
                TelemetryClient.sendErrorEvent(`${commandId}.end`, properties);
            } else {
                TelemetryClient.sendEvent(`${commandId}.end`, properties);
            }
        }
    }, debounce);
}

function setupControlView(context: vscode.ExtensionContext) {
    AzureSessionProviderHelper.activateAzureSessionProvider(context);
    const sessionProvider = AzureSessionProviderHelper.getSessionProvider();
    const azureAccountTreeItem = createAzureAccountTreeItem(sessionProvider);
    context.subscriptions.push(azureAccountTreeItem);
    ext.treeItem = azureAccountTreeItem;
    const treeDataProvider = new AzExtTreeDataProvider(azureAccountTreeItem, "appService.loadMore");
    ext.treeItem = azureAccountTreeItem;
    ext.treeDataProvider = treeDataProvider;
    const treeView = vscode.window.createTreeView("apiCenterTreeView", { treeDataProvider });
    context.subscriptions.push(treeView);
    treeView.onDidChangeSelection((e: vscode.TreeViewSelectionChangeEvent<AzExtTreeItem>) => {
        const selectedNode = e.selection[0];
        ext.outputChannel.appendLine(selectedNode.id!);
        ext.context.globalState.update(selectedNodeKey, selectedNode.id);
    });
}

function setupDataTreeView(context: vscode.ExtensionContext) {
    ext.dataPlaneAccounts = [];
    AzureDataSessionProviderHelper.activateAzureSessionProvider(context);
    const dataPlaneSessionProvider = AzureDataSessionProviderHelper.getSessionProvider();
    const dataPlanAccountManagerTreeItem = createAzureDataAccountTreeItem(dataPlaneSessionProvider);
    context.subscriptions.push(dataPlanAccountManagerTreeItem);
    ext.dataPlaneTreeItem = dataPlanAccountManagerTreeItem;
    const workspaceTreeDataProvider = new AzExtTreeDataProvider(dataPlanAccountManagerTreeItem, "appService.loadMore");
    ext.dataPlaneTreeDataProvider = workspaceTreeDataProvider;
    vscode.window.registerTreeDataProvider('apiCenterWorkspace', workspaceTreeDataProvider);
}

export function deactivate() { }
