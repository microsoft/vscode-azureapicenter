import * as vscode from 'vscode';

export class GenerateApiLibrary {
    public async generate(path: string): Promise<void> {
        // Generate library with Kiota
        const descriptionUrl = encodeURIComponent(path);
        const uriScheme = vscode.env.uriScheme;
        const deepLink = `${uriScheme}://ms-graph.kiota/OpenDescription?descriptionUrl=${descriptionUrl}`;
        const uri = vscode.Uri.parse(deepLink);

        await vscode.env.openExternal(uri);
    }
}