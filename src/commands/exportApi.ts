// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from "fs-extra";
import * as http from 'http';
import * as https from 'https';
import * as path from "path";
import * as vscode from "vscode";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiSpecExportResultFormat } from "../azure/ApiCenter/contracts";
import { TelemetryClient } from '../common/telemetryClient';
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { ApiDefinitionTreeItem, fetchApiCenterServer } from "../tree/DataPlaneAccount";
import { createTemporaryFolder } from "../utils/fsUtil";
import { getSessionToken } from "./workspaceApis";
export namespace ExportAPI {
    export async function exportApi(
        context: IActionContext,
        node?: ApiVersionDefinitionTreeItem | ApiDefinitionTreeItem): Promise<void> {
        if (!node) {
            node = await ext.treeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(new RegExp(`${ApiVersionDefinitionTreeItem.contextValue}*`), context);
        }
        if (node instanceof ApiVersionDefinitionTreeItem) {
            const apiCenterService = new ApiCenterService(
                node?.subscription!,
                getResourceGroupFromId(node?.id!),
                node?.apiCenterName!);
            const exportedSpec = await apiCenterService.exportSpecification(
                node?.apiCenterApiName!,
                node?.apiCenterApiVersionName!,
                node?.apiCenterApiVersionDefinition.name!);
            await writeToTempFile(node!, exportedSpec.format, exportedSpec.value);
        } else if (node instanceof ApiDefinitionTreeItem) {
            let accessToken = await getSessionToken(node.account.clientId, node.account.tenantId);
            if (accessToken) {
                let server = new fetchApiCenterServer(node.account.domain, accessToken);
                let results = await server.exportDefinitionLink(node.apiName, node.apiVersion, node.label);
                if (results) {
                    const folderName = `${node.apiCenterName}-${node.apiName}`;
                    const folderPath = await createTemporaryFolder(folderName);
                    const localFilePath: string = path.join(folderPath, node.label);
                    await fs.ensureFile(localFilePath);
                    await downloadFile(results, localFilePath);
                    const document: vscode.TextDocument = await vscode.workspace.openTextDocument(localFilePath);
                    await vscode.window.showTextDocument(document);
                }
            }
        }
    }

    function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
    }

    function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterApiVersionDefinition.name}`;
    }

    async function writeToTempFile(node: ApiVersionDefinitionTreeItem, specFormat: string, specValue: string) {
        if (specFormat === ApiSpecExportResultFormat.inline) {
            await ExportAPI.showTempFile(node, specValue);
        } else {
            // Currently at server side did not exist link, so just monitor this event.
            TelemetryClient.sendEvent("azure-api-center.exportApi", { format: specFormat });
        }
    }

    async function downloadFile(url: string, filePath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const client = url.startsWith('https') ? https : http;

            client.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`request failed with status code: ${response.statusCode}`));
                    return;
                }

                const fileStream = fs.createWriteStream(filePath);

                response.pipe(fileStream);

                fileStream.on('finish', () => {
                    console.log('finished!!!!!!!!');
                    fileStream.close();
                    resolve();
                });

            }).on('error', (err) => {
                reject(new Error('download error: ' + err.message));
            });
        });
    }

    export async function showTempFile(node: ApiVersionDefinitionTreeItem, fileContent: string) {
        const folderName = getFolderName(node);
        const folderPath = await createTemporaryFolder(folderName);
        const fileName = getFilename(node);
        const localFilePath: string = path.join(folderPath, fileName);
        await fs.ensureFile(localFilePath);
        const document: vscode.TextDocument = await vscode.workspace.openTextDocument(localFilePath);
        await vscode.workspace.fs.writeFile(vscode.Uri.file(localFilePath), Buffer.from(fileContent));
        await vscode.window.showTextDocument(document);
    }
}
