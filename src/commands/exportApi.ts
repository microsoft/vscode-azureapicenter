// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from "fs-extra";

import * as path from "path";
import * as vscode from "vscode";
import { ApiSpecExportResultFormat } from "../azure/ApiCenter/contracts";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { UiStrings } from "../uiStrings";
import { GeneralUtils } from "../utils/generalUtils";
import { inferDefinitionFileType } from "../utils/inferDefinitionFileType";
import { treeUtils } from "../utils/treeUtils";
export namespace ExportAPI {
    export async function exportApi(
        context: IActionContext,
        node?: ApiVersionDefinitionTreeItem): Promise<void> {
        if (!node) {
            node = await treeUtils.getDefinitionTreeNode(context);
        }
        if (!node) {
            return;
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
            await ExportAPI.showTempFile(node, await GeneralUtils.fetchDataFromLink(specValue));
        }
    }

    export async function showTempFile(node: ApiVersionDefinitionTreeItem, fileContent: string) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error(UiStrings.NoFolderOpened);
        }
        const folderPath: string = workspaceFolders[0].uri.fsPath;
        const fileName = getFilename(node);
        const fileType = inferDefinitionFileType(fileContent);
        const localFilePath: string = path.join(folderPath, fileName + fileType);
        await fs.ensureFile(localFilePath);
        const document: vscode.TextDocument = await vscode.workspace.openTextDocument(localFilePath);
        await vscode.workspace.fs.writeFile(vscode.Uri.file(localFilePath), Buffer.from(fileContent));
        await vscode.window.showTextDocument(document);
    }
}
