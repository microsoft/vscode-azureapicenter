// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import { OpenAPIV3 } from "openapi-types";
import * as vscode from "vscode";
import { ApiSpecExportResultFormat } from "../azure/ApiCenter/contracts";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { writeToTemporaryFile } from "../utils/fsUtil";
import { GeneralUtils } from "../utils/generalUtils";
import { OpenApiUtils } from "../utils/openApiUtils";

export async function registerAsMcpServer(context: IActionContext, node: ApiVersionDefinitionTreeItem) {

    const exportedSpec = await node!.apiCenterApiVersionDefinition.getDefinitions(node!.subscription, node!.apiCenterName, node!.apiCenterApiName, node!.apiCenterApiVersionName);
    const fileContent = (exportedSpec.format === ApiSpecExportResultFormat.link) ? await GeneralUtils.fetchDataFromLink(exportedSpec.value) : exportedSpec.value;

    const fileUri = await writeApiSpecToTemporaryFile(fileContent, node!);
    const api = await OpenApiUtils.pasreDefinitionFileRawToOpenAPIV3FullObject(fileContent);
    await updateVsCodeSettings(fileUri.fsPath, api, node.apiCenterApiName);
    vscode.window.showInformationMessage(`MCP server is registered for '${node.apiCenterApiName}'. You can now use the MCP server in GitHub Copilot Agent Mode.`);
}

async function updateVsCodeSettings(filePath: string, api: OpenAPIV3.Document, apiName: string) {
    const configuration = vscode.workspace.getConfiguration();
    const servers = configuration.get<any>("mcp.servers") || {};
    servers[`openapi_mcp_server_${apiName}`] = {
        command: "python",
        args: ["-m", "openapi_mcp_server"],
        env: {
            DEBUG: "1",
            API_BASE_URL: api.servers?.[0]?.url,
            OPENAPI_SPEC_PATH: filePath,
            API_HEADERS: "Accept:application/json",
        }
    };
    await configuration.update("mcp.servers", servers, vscode.ConfigurationTarget.Global);
}

export async function writeApiSpecToTemporaryFile(fileContent: string, node: ApiVersionDefinitionTreeItem): Promise<vscode.Uri> {
    const folderName = getFolderName(node);
    const fileName = getFilename(node);
    return await writeToTemporaryFile(fileContent, folderName, fileName);
}

function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
    return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
}

function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
    return `${treeItem.apiCenterApiVersionDefinition.getName()}-mcp-temp`;
}
