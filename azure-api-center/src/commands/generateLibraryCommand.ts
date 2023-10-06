import * as vscode from 'vscode';

export class GenerateApiLibrary {
    public async generate(): Promise<void> {
        const url = 'https://conferenceapi.azurewebsites.net/?format=yaml';

        // Open API description in Kiota
        const openApiKiotaCommand = 'kiota.openApiExplorer.openDescription';
        vscode.commands.executeCommand(openApiKiotaCommand, url);

        // Generate library with Kiota
        const generateClientCommand = 'kiota.openApiExplorer.generateClient';
        vscode.commands.executeCommand(generateClientCommand);
    }
}