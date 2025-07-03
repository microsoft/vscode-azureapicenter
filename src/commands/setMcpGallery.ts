// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { ApiCenterTreeItem } from "../tree/ApiCenterTreeItem";

export async function setMcpGallery(actionContext: IActionContext, node: ApiCenterTreeItem) {
    const dataApiHostname = node.apicenter.properties.dataApiHostname;
    let mcpGalleryServiceUrl = `https://${dataApiHostname}/workspaces/default/v0/servers`;
    mcpGalleryServiceUrl = "https://demo-mcp-registry.data.centraluseuap.azure-apicenter.ms/workspaces/default/v0/servers";

    try {
        // Get the full path to VS Code settings.json
        const appDataPath = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');

        // Determine if we're running in VS Code stable or Insiders
        const vscodeVersion = vscode.env.appName.includes('Insiders') ? 'Code - Insiders' : 'Code';
        const settingsPath = path.join(appDataPath, vscodeVersion, 'User', 'settings.json');

        // Read the current settings
        let settings: any = {};
        const settingsContent = await fs.readFile(settingsPath, 'utf8');
        // Remove comments from JSON content before parsing (avoid removing URLs with //)
        const cleanedContent = settingsContent
            .replace(/^\s*\/\/.*$/gm, '') // Remove lines that start with // (ignoring leading whitespace)
            .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove /* */ comments
        settings = JSON.parse(cleanedContent);

        // Update the MCP gallery service URL
        settings["chat.mcp.gallery.serviceUrl"] = mcpGalleryServiceUrl;

        // Write back to settings.json
        await fs.writeFile(settingsPath, JSON.stringify(settings, null, 4), 'utf8');

        vscode.window.showInformationMessage(`MCP Gallery service URL updated to: ${mcpGalleryServiceUrl}`);
    } catch (error) {
        console.error('Error updating settings.json:', error);
        vscode.window.showErrorMessage(`Failed to update MCP Gallery service URL: ${error}`);
    }
}
