import * as vscode from 'vscode';

export class PostmanOpener {
    public async open(): Promise<void> {
        const postmanCommandId = 'postman-for-vscode.sidebar-panel.focus';
        await vscode.commands.executeCommand(postmanCommandId);
    }
}