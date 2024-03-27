// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { createTemporaryFolder } from "../utils/fsUtil";

export async function exportOpenApi(
    context: IActionContext,
    node?: ApiVersionDefinitionTreeItem): Promise<void> {

    const apiCenterService = new ApiCenterService(
        node?.subscription!,
        getResourceGroupFromId(node?.id!),
        node?.apiCenterName!);

    const exportedSpec = await apiCenterService.exportSpecification(
        node?.apiCenterApiName!,
        node?.apiCenterApiVersionName!,
        node?.apiCenterApiVersionDefinition.name!);

    await writeToHttpFile(node!, exportedSpec.format, exportedSpec.value);
}

function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
    return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
}

function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
    return `${treeItem.apiCenterApiVersionName}-tempFile.http`;
}

async function writeToHttpFile(node: ApiVersionDefinitionTreeItem, httpFileContent: string, value: string) {
    const folderName = getFolderName(node);
    const folderPath = await createTemporaryFolder(folderName);
    const fileName = getFilename(node);
    const localFilePath: string = path.join(folderPath, fileName);
    await fs.ensureFile(localFilePath);
    const document: vscode.TextDocument = await vscode.workspace.openTextDocument(localFilePath);
    await vscode.workspace.fs.writeFile(vscode.Uri.file(localFilePath), Buffer.from(value));
    await vscode.window.showTextDocument(document);
}
