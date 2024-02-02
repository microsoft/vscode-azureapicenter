// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

"use strict";
import { instance, mock, when } from 'ts-mockito';
import * as vscode from "vscode";
import * as vscodeMocks from './vsc';
import { vscMockTelemetryReporter } from "./vsc/telemetryReporter";
import { vscUri } from "./vsc/uri";
const Module = require("module");

type VSCode = typeof vscode;

const mockedVSCode: Partial<VSCode> = {};
export const mockedVSCodeNamespaces: { [P in keyof VSCode]: VSCode[P] } = {} as any;
const originalLoad = Module._load;

export function resetVSCodeMocks() {
    generateMock('workspace');
    generateMock('window');
    generateMock('languages');
    generateMock('env');
    generateMock('debug');
    generateMock('scm');
    generateMock('env');
    generateMock('notebooks');
    generateMock('commands');
    generateMock('extensions');

    when(mockedVSCodeNamespaces.workspace.notebookDocuments).thenReturn([]);
    when(mockedVSCodeNamespaces.window.visibleNotebookEditors).thenReturn([]);
    when(mockedVSCodeNamespaces.window.activeTextEditor).thenReturn(undefined);
    // Use mock clipboard fo testing purposes.
    const clipboard = new MockClipboard();
    when(mockedVSCodeNamespaces.env.clipboard).thenReturn(clipboard);
    when(mockedVSCodeNamespaces.env.appName).thenReturn('Insider');
}

export function initialize() {
    resetVSCodeMocks();

    // When upgrading to npm 9-10, this might have to change, as we could have explicit imports (named imports).
    Module._load = function (request: any, _parent: any) {
        if (request === 'vscode') {
            return mockedVSCode;
        }
        if (request === '@vscode/extension-telemetry') {
            return { default: vscMockTelemetryReporter as any };
        }
        // less files need to be in import statements to be converted to css
        // But we don't want to try to load them in the mock vscode
        if (/\.less$/.test(request)) {
            return;
        }
        return originalLoad.apply(this, arguments);
    };
}

mockedVSCode.MarkdownString = vscodeMocks.vscMock.MarkdownString;
mockedVSCode.Hover = vscodeMocks.vscMock.Hover;
mockedVSCode.Disposable = vscodeMocks.vscMock.Disposable as any;
mockedVSCode.ExtensionKind = vscodeMocks.vscMock.ExtensionKind;
mockedVSCode.CodeAction = vscodeMocks.vscMock.CodeAction;
mockedVSCode.EventEmitter = vscodeMocks.vscMock.EventEmitter;
mockedVSCode.CancellationTokenSource = vscodeMocks.vscMock.CancellationTokenSource;
mockedVSCode.CompletionItemKind = vscodeMocks.vscMock.CompletionItemKind;
mockedVSCode.SymbolKind = vscodeMocks.vscMock.SymbolKind;
mockedVSCode.IndentAction = vscodeMocks.vscMock.IndentAction;
mockedVSCode.Uri = vscUri as any;
mockedVSCode.Range = vscodeMocks.vscMockExtHostedTypes.Range;
mockedVSCode.Position = vscodeMocks.vscMockExtHostedTypes.Position;
mockedVSCode.Selection = vscodeMocks.vscMockExtHostedTypes.Selection;
mockedVSCode.Location = vscodeMocks.vscMockExtHostedTypes.Location;
mockedVSCode.SymbolInformation = vscodeMocks.vscMockExtHostedTypes.SymbolInformation;
mockedVSCode.CallHierarchyItem = vscodeMocks.vscMockExtHostedTypes.CallHierarchyItem;
mockedVSCode.CompletionItem = vscodeMocks.vscMockExtHostedTypes.CompletionItem;
mockedVSCode.CompletionItemKind = vscodeMocks.vscMockExtHostedTypes.CompletionItemKind;
mockedVSCode.CodeLens = vscodeMocks.vscMockExtHostedTypes.CodeLens;
mockedVSCode.Diagnostic = vscodeMocks.vscMockExtHostedTypes.Diagnostic;
mockedVSCode.DiagnosticSeverity = vscodeMocks.vscMockExtHostedTypes.DiagnosticSeverity;
mockedVSCode.SnippetString = vscodeMocks.vscMockExtHostedTypes.SnippetString;
mockedVSCode.ConfigurationTarget = vscodeMocks.vscMockExtHostedTypes.ConfigurationTarget;
mockedVSCode.StatusBarAlignment = vscodeMocks.vscMockExtHostedTypes.StatusBarAlignment;
mockedVSCode.SignatureHelp = vscodeMocks.vscMockExtHostedTypes.SignatureHelp;
mockedVSCode.DocumentLink = vscodeMocks.vscMockExtHostedTypes.DocumentLink;
mockedVSCode.TextEdit = vscodeMocks.vscMockExtHostedTypes.TextEdit;
mockedVSCode.WorkspaceEdit = vscodeMocks.vscMockExtHostedTypes.WorkspaceEdit;
mockedVSCode.RelativePattern = vscodeMocks.vscMockExtHostedTypes.RelativePattern;
mockedVSCode.ProgressLocation = vscodeMocks.vscMockExtHostedTypes.ProgressLocation;
mockedVSCode.ViewColumn = vscodeMocks.vscMockExtHostedTypes.ViewColumn;
mockedVSCode.TextEditorRevealType = vscodeMocks.vscMockExtHostedTypes.TextEditorRevealType;
mockedVSCode.TreeItem = vscodeMocks.vscMockExtHostedTypes.TreeItem;
mockedVSCode.TreeItemCollapsibleState = vscodeMocks.vscMockExtHostedTypes.TreeItemCollapsibleState;
mockedVSCode.CodeActionKind = vscodeMocks.vscMock.CodeActionKind;
mockedVSCode.CompletionItemKind = vscodeMocks.vscMockExtHostedTypes.CompletionItemKind;
mockedVSCode.CompletionTriggerKind = vscodeMocks.vscMockExtHostedTypes.CompletionTriggerKind;
mockedVSCode.DebugAdapterExecutable = vscodeMocks.vscMockExtHostedTypes.DebugAdapterExecutable;
mockedVSCode.DebugAdapterServer = vscodeMocks.vscMockExtHostedTypes.DebugAdapterServer;
mockedVSCode.QuickInputButtons = vscodeMocks.vscMockExtHostedTypes.QuickInputButtons;
mockedVSCode.FileType = vscodeMocks.vscMock.FileType;
mockedVSCode.UIKind = vscodeMocks.vscMock.UIKind;
mockedVSCode.FileSystemError = vscodeMocks.vscMockExtHostedTypes.FileSystemError;
mockedVSCode.QuickPickItemKind = vscodeMocks.vscMockExtHostedTypes.QuickPickItemKind;
mockedVSCode.ThemeIcon = vscodeMocks.vscMockExtHostedTypes.ThemeIcon;
mockedVSCode.ThemeColor = vscodeMocks.vscMockExtHostedTypes.ThemeColor;
mockedVSCode.Task = vscodeMocks.vscMockExtHostedTypes.Task;
(mockedVSCode as any).NotebookCellKind = vscodeMocks.vscMockExtHostedTypes.NotebookCellKind;
(mockedVSCode as any).NotebookCellRunState = vscodeMocks.vscMockExtHostedTypes.NotebookCellRunState;
(mockedVSCode as any).NotebookControllerAffinity = vscodeMocks.vscMockExtHostedTypes.NotebookControllerAffinity;
(mockedVSCode as any).NotebookCellOutputItem = vscodeMocks.vscMockExtHostedTypes.NotebookCellOutputItem;
(mockedVSCode as any).NotebookCellExecutionState = vscodeMocks.vscMockExtHostedTypes.NotebookCellExecutionState;
mockedVSCode.TaskRevealKind = vscodeMocks.vscMockExtHostedTypes.TaskRevealKind;
mockedVSCode.NotebookCellOutput = vscodeMocks.vscMockExtHostedTypes.NotebookCellOutput;

// Setup window APIs
(mockedVSCode as any).window = {
    activeTextEditor: undefined,
    activeTerminal: undefined,
    terminals: [],
    showInformationMessage: () => { },
    showErrorMessage: () => {
        return Promise.resolve("success");
    },
    showWarningMessage: () => { },
    createOutputChannel: () => { },
    registerTreeDataProvider: () => { },
    withProgress: async (options: any, task: (progress: any, token: any) => Promise<any>) => {
        return await task({ report: () => { } }, new vscodeMocks.vscMock.CancellationToken());
    },
    createQuickPick: () => { },
    showOpenDialog: () => { },
    showTextDocument: () => { },
    createTerminal: () => { },
};
(mockedVSCode as any).workspace = {
    workspaceFolders: undefined,
    openTextDocument: () => { },
    createFileSystemWatcher: (globPattern: vscode.GlobPattern) => { },
    getConfiguration: () => { },
};

// Setup extensions APIs
mockedVSCode.extensions = {
    getExtension: () => {
        return undefined;
    },
    onDidChange: () => {
        return new vscodeMocks.vscMockExtHostedTypes.Disposable(() => {
            return;
        });
    },
    all: [],
};

function format(value: string, ...args: string[]) {
    return value.replace(/{(\d+)}/g, (match, number) => (args[number] === undefined ? match : args[number]));
}

mockedVSCode.l10n = {
    bundle: undefined,
    t: (arg1: string | { message: string; args?: string[] | Record<string, string> }, ...restOfArguments: string[]) => {
        if (typeof arg1 === 'string') {
            if (restOfArguments.length === 0) {
                return arg1;
            }
            if (typeof restOfArguments === 'object' && !Array.isArray(restOfArguments)) {
                throw new Error('Records for l10n.t() are not supported in the mock');
            }
            return format(arg1, ...restOfArguments);
        }
        if (typeof arg1 === 'object') {
            const message = arg1.message;
            const args = arg1.args || [];
            if (typeof args === 'object' && !Array.isArray(args)) {
                throw new Error('Records for l10n.t() are not supported in the mock');
            }
            if (args.length === 0) {
                return message;
            }
            return format(message, ...args);
        }
        return arg1;
    },
    uri: undefined
} as any;

// Setup commands APIs
mockedVSCode.commands = {
    executeCommand: () => {
        const res: any = "success";
        return Promise.resolve(res);
    },
    registerCommand: (command: string, callback: (...args: any[]) => any, thisArg?: any) => {
        return new vscodeMocks.vscMockExtHostedTypes.Disposable(() => {
            return;
        });
    },
    getCommands: (filter: boolean | undefined) => {
        return Promise.resolve([]);
    },
    registerTextEditorCommand: () => {
        return new vscodeMocks.vscMockExtHostedTypes.Disposable(() => {
            return;
        });
    },
};

// Setup textDocument APIs
(mockedVSCode as any).TextDocument = {
    fileName: "",
    getText: () => {
        return "";
    },
};

function generateNotebookMocks() {
    const mockedObj = mock<Record<string, unknown>>();
    (mockedVSCode as any).notebook = instance(mockedObj);
    (mockedVSCodeNamespaces as any).notebook = mockedObj;
}

function generateMock<K extends keyof VSCode>(name: K): void {
    const mockedObj = mock<VSCode[K]>();
    mockedVSCode[name] = instance(mockedObj);
    mockedVSCodeNamespaces[name] = mockedObj;
}

class MockClipboard {
    private text = "";
    public readText(): Promise<string> {
        return Promise.resolve(this.text);
    }
    public async writeText(value: string): Promise<void> {
        this.text = value;
    }
}
