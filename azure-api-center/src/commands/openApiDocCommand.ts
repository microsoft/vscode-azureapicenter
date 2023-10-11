import axios from 'axios';
import * as vscode from 'vscode';

export class OpenApiFileOpener {
    public async open(): Promise<void> {
        const swaggerCommandId = 'swagger.preview';
        vscode.commands.executeCommand(swaggerCommandId);
    }
}