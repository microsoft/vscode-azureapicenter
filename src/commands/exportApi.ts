// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { DefinitionFormat, openapi } from "../constants";
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { createTemporaryFolder } from "../utils/fsUtil";
export namespace ExportAPI {
    export async function exportApi(
        context: IActionContext,
        node?: ApiVersionDefinitionTreeItem): Promise<void> {
        if (!node) {
            node = await ext.treeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(`${ApiVersionDefinitionTreeItem.contextValue}-${openapi}`, context);
        }

        const apiCenterService = new ApiCenterService(
            node?.subscription!,
            getResourceGroupFromId(node?.id!),
            node?.apiCenterName!);
        const exportedSpec = await apiCenterService.exportSpecification(
            node?.apiCenterApiName!,
            node?.apiCenterApiVersionName!,
            node?.apiCenterApiVersionDefinition.name!);
        await writeToTempFile(node!, exportedSpec.format, exportedSpec.value);
    }

    function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
    }

    function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterApiVersionDefinition.name}`;
    }

    async function writeToTempFile(node: ApiVersionDefinitionTreeItem, specFormat: string, specValue: string) {
        if (specFormat === DefinitionFormat.inline) {
            await ExportAPI.showTmpFile(node, specValue);
        }
    }

    export async function showTmpFile(node: ApiVersionDefinitionTreeItem, fileContent: string) {
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
