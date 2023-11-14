import * as vscode from 'vscode';
import { commands } from "vscode";

// Commands
// Copilot

// Tree View UI
import { registerAzureUtilsExtensionVariables } from '@microsoft/vscode-azext-azureutils';
import { AzExtTreeDataProvider, AzExtTreeItem, IActionContext, createAzExtOutputChannel, registerCommand, registerEvent } from '@microsoft/vscode-azext-utils';
import { showOpenApi } from './commands/editOpenApi';
import { exportOpenApi } from './commands/exportOpenApi';
import { generateApiLibrary } from './commands/generateApiLibrary';
import { importOpenApi } from './commands/importOpenApi';
import { openAPiInSwagger } from './commands/openApiInSwagger';
import { refreshTree } from './commands/refreshTree';
import { testInPostman } from './commands/testInPostman';
import { doubleClickDebounceDelay, selectedNodeKey } from './constants';
import { ext } from './extensionVariables';
import { ApiVersionDefinitionTreeItem } from './tree/ApiVersionDefinitionTreeItem';
import { AzureAccountTreeItem } from './tree/AzureAccountTreeItem';
import { OpenApiEditor } from './tree/Editors/openApi/OpenApiEditor';

// Copilot Chat
import { AzureAccountApi } from '../src/azure/azureAccount/azureAccountApi';
import { API_CENTER_DESCRIBE_API, API_CENTER_LIST_APIs } from '../src/copilot-chat/constants';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "azure-api-center" is now active!');

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

    const treeView = vscode.window.createTreeView("apiCenterTreeView", { treeDataProvider });
    context.subscriptions.push(treeView);

    treeView.onDidChangeSelection((e: vscode.TreeViewSelectionChangeEvent<AzExtTreeItem>) => {
        const selectedNode = e.selection[0];
        ext.outputChannel.appendLine(selectedNode.id!);
        ext.context.globalState.update(selectedNodeKey, selectedNode.id);
    });

    // Register API Center extension commands
    registerCommand('azure-api-center.selectSubscriptions', () => commands.executeCommand('azure-account.selectSubscriptions'));

    // TODO: move all three to their separate files
    registerCommand('azure-api-center.importOpenApiByFile', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await importOpenApi(context, node, false); });
    registerCommand('azure-api-center.importOpenApiByLink', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await importOpenApi(context, node, true); });
    registerCommand('azure-api-center.exportOpenApi', async (context: IActionContext, node?: ApiVersionDefinitionTreeItem) => { await exportOpenApi(context, node); });

    // TODO: move this to a separate file
    const openApiEditor: OpenApiEditor = new OpenApiEditor();
    context.subscriptions.push(openApiEditor);
    ext.openApiEditor = openApiEditor;

    // TODO: move this to a separate file
    ext.openApiEditor = openApiEditor;

    registerEvent('azure-api-center.openApiEditor.onDidSaveTextDocument',
        vscode.workspace.onDidSaveTextDocument,
        async (actionContext: IActionContext, doc: vscode.TextDocument) => { await openApiEditor.onDidSaveTextDocument(actionContext, context.globalState, doc); });

    registerCommand('azure-api-center.showOpenApi', showOpenApi, doubleClickDebounceDelay);

    registerCommand('azure-api-center.open-api-docs', openAPiInSwagger);

    registerCommand('azure-api-center.open-postman', testInPostman);

    registerCommand('azure-api-center.generate-api-client', generateApiLibrary);

    registerCommand('azure-api-center.apiCenterTreeView.refresh', async (context: IActionContext) => refreshTree(context));

    let handler: vscode.ChatAgentHandler = async (request: vscode.ChatAgentRequest, context: vscode.ChatAgentContext, progress: vscode.Progress<vscode.ChatAgentProgress>, token: vscode.CancellationToken): Promise<vscode.ChatAgentResponse> => {
        let reply = request.prompt;
        const cmd = request.slashCommand?.name

        if (cmd === 'list') {
            try {
                const azureAccountApi = new AzureAccountApi();
                const specifications = await azureAccountApi.getAllSpecifications();
                const access = await vscode.chat.requestChatAccess('copilot');
                const messages = [
                    {
                        role: vscode.ChatMessageRole.System,
                        content: API_CENTER_LIST_APIs.replace("<SPECIFICATIONS>", specifications.map((specification, index) => `## Spec ${index}:\n${specification.properties.value}\n`).join('\n'))
                    },
                    {
                        role: vscode.ChatMessageRole.User,
                        content: 'What are APIs are available for me to use in Azure API Center?'
                    },
                ];

                const platformRequest = await access.makeRequest(messages, {}, token);
                for await (const fragment of platformRequest.response) {
                    const incomingText = fragment.replace('[RESPONSE END]', '');
                    progress.report({ content: `\`>\` ${incomingText}` })
                }
            } catch (error) {
                console.log(error);
            }
        } else if (cmd === 'find') {

        } else if (cmd === '/generate') {

        } else if (cmd === 'describe') {
            const access = await vscode.chat.requestChatAccess('copilot');
            const messages = [
                {
                    role: vscode.ChatMessageRole.System,
                    content: API_CENTER_DESCRIBE_API
                },
                {
                    role: vscode.ChatMessageRole.User,
                    content: `Describe an API using the following specification ${prompt.content}`
                },
            ];

            const platformRequest = await access.makeRequest(messages, {}, token);
            for await (const fragment of platformRequest.response) {
                const incomingText = fragment.replace('[RESPONSE END]', '');
                progress.report({ content: `\`>\` ${incomingText}` })
            }
        }

        return {}
    }

    const agent = vscode.chat.createChatAgent('apicenter', handler)
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
                },
                {
                    name: 'describe',
                    description: 'Describe an API.',
                },
                {
                    name: 'snippet',
                    description: 'Generate a code snippet to consume an API.',
                }
            ]
        },
    }

    context.subscriptions.push(agent);

    // let handler: vscode.ChatAgentHandler = async (request, context, progress, token) => {
    // 	let reply = request.prompt;
    // 	const cmd = request.slashCommand?.name

    // 	if (cmd === 'upcase') {
    // 		reply = reply.toUpperCase();
    //         const access = await vscode.chat.requestChatAccess('copilot');
    //         const messages = [
    //             {
    //                 role: vscode.ChatMessageRole.System,
    //                 content: API_CENTER_LIST_APIs
    //             },
    //             {
    //                 role: vscode.ChatMessageRole.User,
    //                 content: 'What are APIs are available for me to use in Azure API Center?'
    //             },
    //         ];
    //         try {
    //             var a = await access.makeRequest(messages, {}, {
    //                 report: (fragment: vscode.ChatResponseFragment) => {
    //                     const incomingText = fragment.part.replace('[RESPONSE END]', '');
    //                     progress.report({ content: incomingText });
    //                 }
    //             }, token);
    //             console.log(a)
    //         } catch (error) {
    //             console.log(error);
    //         }


    // 	} else if (cmd === 'downcase') {
    // 		reply = reply.toLowerCase();
    // 	}

    // 	progress.report({ content: `\`>\` ${reply}` })
    // 	return {}
    // }

    // const agent = vscode.chat.createChatAgent('echo', handler)
    // agent.description = 'This is a test';
    // agent.fullName = "Echo Echo Echo";
    // agent.slashCommandProvider = {
    // 	provideSlashCommands(token) {
    // 		return [{
    // 			name: 'upcase',
    // 			description: 'Upcase the message',
    // 		}, {
    // 			name: 'downcase',
    // 			description: 'Downcase the message',
    // 		}]
    // 	},
    // }
}

export function deactivate() { }
