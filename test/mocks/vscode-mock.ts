// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

"use strict";

import * as TypeMoq from "typemoq";
import * as vscode from "vscode";
import * as extHostedTypes from "./vsc/extHostedTypes";
import { vscMock } from "./vsc/index";
import { vscMockTelemetryReporter } from "./vsc/telemetryReporter";
import { vscUri } from "./vsc/uri";
const Module = require("module");

type VSCode = typeof vscode;

const mockedVSCode: Partial<VSCode> = {};
const mockedVSCodeNamespaces: { [P in keyof VSCode]?: TypeMoq.IMock<VSCode[P]> } = {};
const originalLoad = Module._load;

export function initialize() {
    generateMock("languages");
    generateMock("env");
    generateMock("debug");
    generateMock("scm");
    generateNotebookMocks();

    // Use mock clipboard fo testing purposes.
    const clipboard = new MockClipboard();
    mockedVSCodeNamespaces.env?.setup((e) => e.clipboard).returns(() => clipboard);
    mockedVSCodeNamespaces.env?.setup((e) => e.appName).returns(() => "Insider");

    // When upgrading to npm 9-10, this might have to change, as we could have explicit imports (named imports).
    Module._load = function (request: any, _parent: any) {
        if (request === "vscode") {
            return mockedVSCode;
        }
        if (request === "@vscode/extension-telemetry") {
            return { default: vscMockTelemetryReporter as any };
        }
        // less files need to be in import statements to be converted to css
        // But we don't want to try to load them in the mock vscode
        if (/\.less$/.test(request)) {
            return;
        }
        // eslint-disable-next-line prefer-rest-params
        return originalLoad.apply(this, arguments);
    };
}

mockedVSCode.MarkdownString = vscMock.MarkdownString;
mockedVSCode.Hover = vscMock.Hover;
mockedVSCode.Disposable = vscMock.Disposable as any;
mockedVSCode.ExtensionKind = vscMock.ExtensionKind;
mockedVSCode.CodeAction = vscMock.CodeAction;
mockedVSCode.EventEmitter = vscMock.EventEmitter;
mockedVSCode.CancellationTokenSource = vscMock.CancellationTokenSource;
mockedVSCode.CompletionItemKind = vscMock.CompletionItemKind;
mockedVSCode.SymbolKind = vscMock.SymbolKind;
mockedVSCode.IndentAction = vscMock.IndentAction;
mockedVSCode.Uri = vscUri as any;
mockedVSCode.Range = extHostedTypes.Range;
mockedVSCode.Position = extHostedTypes.Position;
mockedVSCode.Selection = extHostedTypes.Selection;
mockedVSCode.Location = extHostedTypes.Location;
mockedVSCode.SymbolInformation = extHostedTypes.SymbolInformation;
mockedVSCode.CallHierarchyItem = extHostedTypes.CallHierarchyItem;
mockedVSCode.CompletionItem = extHostedTypes.CompletionItem;
mockedVSCode.CompletionItemKind = extHostedTypes.CompletionItemKind;
mockedVSCode.CodeLens = extHostedTypes.CodeLens;
mockedVSCode.Diagnostic = extHostedTypes.Diagnostic;
mockedVSCode.DiagnosticSeverity = extHostedTypes.DiagnosticSeverity;
mockedVSCode.SnippetString = extHostedTypes.SnippetString;
mockedVSCode.ConfigurationTarget = extHostedTypes.ConfigurationTarget;
mockedVSCode.StatusBarAlignment = extHostedTypes.StatusBarAlignment;
mockedVSCode.SignatureHelp = extHostedTypes.SignatureHelp;
mockedVSCode.DocumentLink = extHostedTypes.DocumentLink;
mockedVSCode.TextEdit = extHostedTypes.TextEdit;
mockedVSCode.WorkspaceEdit = extHostedTypes.WorkspaceEdit;
mockedVSCode.RelativePattern = extHostedTypes.RelativePattern;
mockedVSCode.ProgressLocation = extHostedTypes.ProgressLocation;
mockedVSCode.ViewColumn = extHostedTypes.ViewColumn;
mockedVSCode.TextEditorRevealType = extHostedTypes.TextEditorRevealType;
mockedVSCode.TreeItem = extHostedTypes.TreeItem;
mockedVSCode.TreeItemCollapsibleState = extHostedTypes.TreeItemCollapsibleState;
mockedVSCode.CodeActionKind = vscMock.CodeActionKind;
mockedVSCode.CompletionItemKind = extHostedTypes.CompletionItemKind;
mockedVSCode.CompletionTriggerKind = extHostedTypes.CompletionTriggerKind;
mockedVSCode.DebugAdapterExecutable = extHostedTypes.DebugAdapterExecutable;
mockedVSCode.DebugAdapterServer = extHostedTypes.DebugAdapterServer;
mockedVSCode.QuickInputButtons = extHostedTypes.QuickInputButtons;
mockedVSCode.FileType = vscMock.FileType;
mockedVSCode.UIKind = vscMock.UIKind;
mockedVSCode.FileSystemError = extHostedTypes.FileSystemError;
mockedVSCode.QuickPickItemKind = extHostedTypes.QuickPickItemKind;
mockedVSCode.ThemeIcon = extHostedTypes.ThemeIcon;
mockedVSCode.ThemeColor = extHostedTypes.ThemeColor;
mockedVSCode.Task = extHostedTypes.Task;
(mockedVSCode as any).NotebookCellKind = extHostedTypes.NotebookCellKind;
(mockedVSCode as any).NotebookCellRunState = extHostedTypes.NotebookCellRunState;
(mockedVSCode as any).NotebookControllerAffinity = extHostedTypes.NotebookControllerAffinity;
(mockedVSCode as any).NotebookCellOutputItem = extHostedTypes.NotebookCellOutputItem;
(mockedVSCode as any).NotebookCellExecutionState = extHostedTypes.NotebookCellExecutionState;
mockedVSCode.TaskRevealKind = extHostedTypes.TaskRevealKind;
mockedVSCode.NotebookCellOutput = extHostedTypes.NotebookCellOutput;

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
        return await task({ report: () => { } }, new vscMock.CancellationToken());
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
        return new extHostedTypes.Disposable(() => {
            return;
        });
    },
    all: [],
};

// Setup commands APIs
mockedVSCode.commands = {
    executeCommand: () => {
        const res: any = "success";
        return Promise.resolve(res);
    },
    registerCommand: (command: string, callback: (...args: any[]) => any, thisArg?: any) => {
        return new extHostedTypes.Disposable(() => {
            return;
        });
    },
    getCommands: (filter: boolean | undefined) => {
        return Promise.resolve([]);
    },
    registerTextEditorCommand: () => {
        return new extHostedTypes.Disposable(() => {
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
    const mockedObj = TypeMoq.Mock.ofType<Record<string, unknown>>();
    (mockedVSCode as any).notebook = mockedObj.object;
    (mockedVSCodeNamespaces as any).notebook = mockedObj as any;
}

function generateMock<K extends keyof VSCode>(name: K): void {
    const mockedObj = TypeMoq.Mock.ofType<VSCode[K]>();
    (mockedVSCode as any)[name] = mockedObj.object;
    mockedVSCodeNamespaces[name] = mockedObj as any;
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
