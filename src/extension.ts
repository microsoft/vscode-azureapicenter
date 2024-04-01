// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { commands } from "vscode";
import { TelemetryClient } from './common/telemetryClient';

// Commands
// Copilot

// Tree View UI
import { registerAzureUtilsExtensionVariables } from '@microsoft/vscode-azext-azureutils';
import { AzExtTreeDataProvider, AzExtTreeItem, CommandCallback, IActionContext, IParsedError, createAzExtOutputChannel, parseError, registerCommand, registerEvent } from '@microsoft/vscode-azext-utils';
import { cleanupSearchResult } from './commands/cleanUpSearch';
import { showOpenApi } from './commands/editOpenApi';
import { exportOpenApi } from './commands/exportOpenApi';
import { generateApiLibrary } from './commands/generateApiLibrary';
import { generateHttpFile } from './commands/generateHttpFile';
import { importOpenApi } from './commands/importOpenApi';
import { openAPiInSwagger } from './commands/openApiInSwagger';
import { refreshTree } from './commands/refreshTree';
import { registerApi } from './commands/registerApi';
import { searchApi } from './commands/searchApi';
import { setApiRuleset } from './commands/setApiRuleset';
import { testInPostman } from './commands/testInPostman';
import { chatParticipantId, doubleClickDebounceDelay, selectedNodeKey } from './constants';
import { ext } from './extensionVariables';
import { ApiVersionDefinitionTreeItem } from './tree/ApiVersionDefinitionTreeItem';
import { AzureAccountTreeItem } from './tree/AzureAccountTreeItem';
import { OpenApiEditor } from './tree/Editors/openApi/OpenApiEditor';

// Copilot Chat
import { ErrorProperties, TelemetryProperties } from './common/telemetryEvent';
import { IChatResult, handleChatMessage } from './copilot-chat/copilotChat';

export async function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "azure-api-center" is now active!');

    await TelemetryClient.initialize(context);

    TelemetryClient.sendEvent('activate');

    // https://github.com/microsoft/vscode-azuretools/tree/main/azure
    ext.context = context;
    ext.outputChannel = createAzExtOutputChannel('Azure API Center', ext.prefix);
    context.subscriptions.push(ext.outputChannel);
    registerAzureUtilsExtensionVariables(ext);

    const azureAccountTreeItem = new AzureAccountTreeItem();
    context.subscriptions.push(azureAccountTreeItem);
    ext.treeItem = azureAccountTreeItem;
    // var a = ext.treeItem.subscription;

    const treeDataProvider = new AzExtTreeDataProvider(azureAccountTreeItem, "appService.loadMore");
    ext.treeDataProvider = treeDataProvider;

    const treeView = vscode.window.createTreeView("apiCenterTreeView", { treeDataProvider });
    context.subscriptions.push(treeView);

    treeView.onDidChangeSelection((e: vscode.TreeViewSelectionChangeEvent<AzExtTreeItem>) => {
        const selectedNode = e.selection[0];
        ext.outputChannel.appendLine(selectedNode.id!);
        ext.context.globalState.update(selectedNodeKey, selectedNode.id);
    });

    // Register API Center extension commands
    registerCommandWithTelemetry('azure-api-center.selectSubscriptions', () => commands.executeCommand('azure-account.selectSubscriptions'));

    // TODO: move all three to their separate files
    registerCommandWithTelemetry('azure-api-center.importOpenApiByFile', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await importOpenApi(context, node, false); });
    registerCommandWithTelemetry('azure-api-center.importOpenApiByLink', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await importOpenApi(context, node, true); });
    registerCommandWithTelemetry('azure-api-center.exportOpenApi', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await exportOpenApi(context, node); });

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

    registerCommandWithTelemetry('azure-api-center.generateHttpFile', generateHttpFile);

    registerCommandWithTelemetry('azure-api-center.registerApi', registerApi);

    registerCommandWithTelemetry('azure-api-center.searchApi', searchApi);

    registerCommandWithTelemetry('azure-api-center.cleanupSearchResult', cleanupSearchResult);

    registerCommandWithTelemetry('azure-api-center.setApiRuleset', setApiRuleset);

    registerCommandWithTelemetry('azure-api-center.apiCenterTreeView.refresh', async (context: IActionContext) => refreshTree(context));

    const chatParticipant = vscode.chat.createChatParticipant(chatParticipantId, handleChatMessage);
    chatParticipant.followupProvider = {
        provideFollowups(result: IChatResult, context: vscode.ChatContext, token: vscode.CancellationToken) {
            if (result.metadata.command === 'list') {
                return [{
                    prompt: '$more',
                    label: 'List more APIs'
                } satisfies vscode.ChatFollowup];
            } else if (result.metadata.command === 'find') {
                return [{
                    prompt: '$more',
                    label: 'Find in more APIs'
                } satisfies vscode.ChatFollowup];
            }
        }
    };

    context.subscriptions.push(chatParticipant);
}

async function registerCommandWithTelemetry(commandId: string, callback: CommandCallback, debounce?: number): Promise<void> {
    registerCommand(commandId, async (context: IActionContext, ...args: any[]) => {
        const start: number = Date.now();
        const properties: { [key: string]: string; } = {};
        let parsedError: IParsedError | undefined;
        try {
            TelemetryClient.sendEvent(`${commandId}.start`);
            await callback(context, ...args);
        } catch (error) {
            parsedError = parseError(error);
            throw error;
        } finally {
            const end: number = Date.now();
            properties[TelemetryProperties.duration] = ((end - start) / 1000).toString();
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

export function deactivate() { }
