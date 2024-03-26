// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import * as path from 'path';
import * as vscode from 'vscode';
import { ApiSpecificationOptions, openapi } from "../constants";
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { UiStrings } from "../uiStrings";
import { createTemporaryFolder } from "../utils/fsUtil";
import { DefinitionFileType, inferDefinitionFileType } from "../utils/inferDefinitionFileType";
import { checkNodeVersion } from "../utils/nodeUtils";
import { opticDiff } from "../utils/opticUtils";

export async function detectBreakingChange(context: IActionContext) {
    const nodeVersion = await checkNodeVersion();
    if (!nodeVersion) {
        vscode.window.showErrorMessage(UiStrings.NodeNotInstalled);
        return;
    }

    const apiSpecification1 = await getApiSpecification(UiStrings.SelectFirstApiSpecification, context);
    if (!apiSpecification1) {
        return;
    }
    const apiSpecification2 = await getApiSpecification(UiStrings.SelectSecondApiSpecification, context);
    if (!apiSpecification2) {
        return;
    }

    const [fileInfo1, fileInfo2] = await Promise.all([
        getFileInfoFromApiSpecification(apiSpecification1),
        getFileInfoFromApiSpecification(apiSpecification2)
    ]);

    opticDiff(fileInfo1.fileUri.fsPath, fileInfo2.fileUri.fsPath);

    await vscode.commands.executeCommand('vscode.diff', fileInfo1.fileUri, fileInfo2.fileUri, `${fileInfo1.fileTitle} ↔ ${fileInfo2.fileTitle}`);
}

async function getApiSpecification(title: string, context: IActionContext): Promise<ApiVersionDefinitionTreeItem | vscode.Uri | undefined> {
    const apiSpecificationOption = await vscode.window.showQuickPick(Object.values(ApiSpecificationOptions), { title, ignoreFocusOut: true });

    switch (apiSpecificationOption) {
        case ApiSpecificationOptions.apiCenter:
            const node = await ext.treeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(`${ApiVersionDefinitionTreeItem.contextValue}-${openapi}`, context);
            return node;
        case ApiSpecificationOptions.localFile:
            const fileUri = await vscode.window.showOpenDialog();
            return fileUri?.[0];
        case ApiSpecificationOptions.activeEditor:
            return vscode.window.activeTextEditor?.document.uri;
    }
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
