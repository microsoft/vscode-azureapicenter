import * as vscode from 'vscode';

export class GenerateApiLibrary {
    public async generate(): Promise<void> {
        const url = 'https://conferenceapi.azurewebsites.net/?format=yaml';

        // Generate library with Kiota
        const descriptionUrl = encodeURIComponent(url);
        const uriScheme = vscode.env.uriScheme;
        const deepLink = `${uriScheme}://ms-graph.kiota/OpenDescription?descriptionUrl=${descriptionUrl}`;
        const uri = vscode.Uri.parse(deepLink);

        await vscode.env.openExternal(uri);
    }
}