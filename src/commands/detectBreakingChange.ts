// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { UiStrings } from "../uiStrings";
import { getApiSpecification } from "../utils/apiSpecificationUtils";
import { createTemporaryFolder } from "../utils/fsUtil";
import { DefinitionFileType, inferDefinitionFileType } from "../utils/inferDefinitionFileType";
import { checkNodeVersion } from "../utils/nodeUtils";
import { opticDiff } from "../utils/opticUtils";

export async function detectBreakingChange(context: IActionContext) {
    if (!vscode.workspace.workspaceFolders) {
        throw new Error(UiStrings.NoFolderOpened);
    }

    const nodeVersion = await checkNodeVersion();
    if (!nodeVersion) {
        throw new Error(UiStrings.NoNodeInstalled);
    }

    const apiSpecification1 = await getApiSpecification(UiStrings.SelectFirstApiSpecification, context);
    if (!apiSpecification1) {
        throw new UserCancelledError();
    }
    const apiSpecification2 = await getApiSpecification(UiStrings.SelectSecondApiSpecification, context);
    if (!apiSpecification2) {
        throw new UserCancelledError();
    }

    const [fileInfo1, fileInfo2] = await Promise.all([
        getFileInfoFromApiSpecification(apiSpecification1),
        getFileInfoFromApiSpecification(apiSpecification2)
    ]);

    await Promise.all([
        await opticDiff(fileInfo1.fileUri.fsPath, fileInfo2.fileUri.fsPath),
        await vscode.commands.executeCommand('vscode.diff', fileInfo1.fileUri, fileInfo2.fileUri, `${fileInfo1.fileTitle} ↔ ${fileInfo2.fileTitle}`)
    ]);
}

async function getFileInfoFromApiSpecification(apiSpecification: ApiVersionDefinitionTreeItem | vscode.Uri): Promise<{ fileUri: vscode.Uri, fileTitle: string }> {
    if (apiSpecification instanceof ApiVersionDefinitionTreeItem) {
        const fileUri = await createDefinitionFileUri(apiSpecification);
        const fileTitle = `${apiSpecification.apiCenterApiName}-${apiSpecification.apiCenterApiVersionName}`;
        return { fileUri, fileTitle };
    } else {
        const fileTitle = path.basename(apiSpecification.fsPath);
        return { fileUri: apiSpecification, fileTitle };
    }
}

async function createDefinitionFileUri(node: ApiVersionDefinitionTreeItem): Promise<vscode.Uri> {
    const definitionFileRaw = await ext.openApiEditor.getData(node);

    const folderPath = await createTemporaryFolder(`${node.apiCenterName}-${node.apiCenterApiName}`);
    const fileType: DefinitionFileType = inferDefinitionFileType(definitionFileRaw);
    const fileName: string = `${node.apiCenterApiVersionName}-tempFile${fileType}`;
    const filePath = path.join(folderPath, fileName);

    await fse.ensureFile(filePath);

    const fileUri = vscode.Uri.file(filePath);
    await vscode.workspace.fs.writeFile(fileUri, Buffer.from(definitionFileRaw));

    return fileUri;
}
