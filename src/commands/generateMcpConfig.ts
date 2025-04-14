// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import { OpenAPIV3 } from "openapi-types";
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { writeToTemporaryFile } from "../utils/fsUtil";
import { OpenApiUtils } from "../utils/openApiUtils";
import { GenerateHttpFile } from "./generateHttpFile";
export async function generateMcpConfig(
    context: IActionContext,
    node?: ApiVersionDefinitionTreeItem): Promise<void> {
    if (!node) {
        return;
    }
    const definitionFileRaw = await ext.openApiEditor.getData(node!);
    const api = await OpenApiUtils.pasreDefinitionFileRawToSwaggerObject(definitionFileRaw);
    const apidefins = JSON.parse(api);
    const servers = apidefins.servers![0];

    let funcSpec: GenerateHttpFile.ApiKeySecuritySchemesWithValue = { type: 'apiKey', in: 'header', name: 'x-functions-key' } as any as GenerateHttpFile.ApiKeySecuritySchemesWithValue

    const apiKeySecuritySchemesWithValue = await GenerateHttpFile.getApiKeySecuritySchemesWithValue(funcSpec, node!);

    await GenerateHttpFile.writeToHttpFile(node!, apiKeySecuritySchemesWithValue as any as string);
    // const httpFileContent = await parseSwaggerObjectToHttpFileContent(api, node!);
    // const servers = api.servers
    // await GenerateHttpFile.writeToHttpFile(node!, httpFileContent);
}

export async function writeToHttpFile(node: ApiVersionDefinitionTreeItem, httpFileContent: string) {
    const folderName = getFolderName(node);
    const fileName = getFilename(node);

    const fileUri = await writeToTemporaryFile(httpFileContent, folderName, fileName);

    await vscode.window.showTextDocument(fileUri);
}

function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
    return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
}

function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
    return `${treeItem.apiCenterApiVersionName}-tempFile.http`;
}


export async function parseSwaggerObjectToHttpFileContent(api: OpenAPIV3.Document, node: ApiVersionDefinitionTreeItem): Promise<string> {
    const apiKeySecuritySchemes = GenerateHttpFile.getApiKeySecuritySchemes(api);
    const apiKeySecuritySchemesWithValue = await GenerateHttpFile.getApiKeySecuritySchemesWithValue(apiKeySecuritySchemes, node!);
    return GenerateHttpFile.parseSwaggerObjectToHttpFileContentWithAuth(api, apiKeySecuritySchemesWithValue);
}

