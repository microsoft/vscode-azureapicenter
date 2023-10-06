import axios from 'axios';
import * as vscode from 'vscode';

export class OpenApiFileOpener {
    public async open(): Promise<void> {
        const data = await this.download();
        const doc = await vscode.workspace.openTextDocument({ content: data.toString() });
        await vscode.window.showTextDocument(doc);
        // Using this extension for now... https://marketplace.visualstudio.com/items?itemName=Arjun.swagger-viewer
        const swaggerCommandId = 'swagger.preview';
        vscode.commands.executeCommand(swaggerCommandId);
    }

    private async download(): Promise<string> {
        const url = 'https://conferenceapi.azurewebsites.net/?format=yaml';
        const response = await axios.get(url);

        return JSON.stringify(response.data, null, 4);
    }
}