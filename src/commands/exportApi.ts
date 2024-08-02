// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from "fs-extra";
import fetch from 'node-fetch';
import * as path from "path";
import * as vscode from "vscode";
import { ApiCenterVersionDefinitionManagement } from "../azure/ApiCenter/ApiCenterDefinition";
import { ApiSpecExportResultFormat } from "../azure/ApiCenter/contracts";
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { createTemporaryFolder } from "../utils/fsUtil";
export namespace ExportAPI {
    export async function exportApi(
        context: IActionContext,
        node?: ApiVersionDefinitionTreeItem): Promise<void> {
        if (!node) {
            node = await ext.treeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(new RegExp(`${ApiCenterVersionDefinitionManagement.contextValue}*`), context);
        }

        const exportedSpec = await node?.apiCenterApiVersionDefinition.getDefinitions(node?.subscription!, node?.apiCenterName!, node?.apiCenterApiName!, node?.apiCenterApiVersionName!);
        await writeToTempFile(node!, exportedSpec.format, exportedSpec.value);
    }

    function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
    }

    function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterApiVersionDefinition.getName()}`;
    }

    async function writeToTempFile(node: ApiVersionDefinitionTreeItem, specFormat: string, specValue: string) {
        if (specFormat === ApiSpecExportResultFormat.inline) {
            await ExportAPI.showTempFile(node, specValue);
        } else if (specFormat === ApiSpecExportResultFormat.link) {
            await ExportAPI.showTempFile(node, await ExportAPI.fetchDataFromLink(specValue));
        }
    }

    export async function fetchDataFromLink(link: string): Promise<string> {
        try {
            const res = await fetch(link);
            const rawData = await res.json();
            return JSON.stringify(rawData);
        }
        catch (err) {
            throw err;
        }
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
