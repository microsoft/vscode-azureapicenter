// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import * as fs from "fs";
import * as path from 'path';
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { UiStrings } from "../uiStrings";
import { getApiSpecification } from "../utils/apiSpecificationUtils";
// @ts-ignore
import * as widdershins from "widdershins";
import { makrdownDocuments } from "../constants";
import { writeToTemporaryFile } from "../utils/fsUtil";
import { OpenApiUtils } from "../utils/openApiUtils";

export async function generateMarkdownDocument(context: IActionContext, node?: ApiVersionDefinitionTreeItem) {
    const apiSpecification = await getApiSpecification(UiStrings.SelectApiSpecification, context);
    if (!apiSpecification) {
        throw new UserCancelledError();
    }

    let apiSpecificationContent: string;
    let folderName: string;
    let fileName: string;
    if (apiSpecification instanceof ApiVersionDefinitionTreeItem) {
        apiSpecificationContent = await ext.openApiEditor.getData(apiSpecification);
        folderName = `${apiSpecification.apiCenterName}-${apiSpecification.apiCenterApiName}`;
        fileName = `${apiSpecification.apiCenterApiVersionName}-tempFile.md`;
    } else {
        apiSpecificationContent = await fs.promises.readFile(apiSpecification.fsPath, { encoding: 'utf-8' });
        folderName = makrdownDocuments;
        fileName = `${path.basename(apiSpecification.fsPath)}-tempFile.md`;
    }

    await showMarkdownDocument(apiSpecificationContent, folderName, fileName);
}

async function showMarkdownDocument(apiSpecificationContent: string, folderName: string, fileName: string) {
    const markdownOutput = await convertApiToMarkdown(apiSpecificationContent);

    const fileUri = await writeToTemporaryFile(markdownOutput, folderName, fileName);

    await vscode.window.showTextDocument(fileUri);
    await vscode.commands.executeCommand('markdown.showPreviewToSide', fileUri);
}

async function convertApiToMarkdown(apiSpecificationContent: string): Promise<string> {
    const openApiObject = OpenApiUtils.pasreDefinitionFileRawToSwaggerObject(apiSpecificationContent);
    const options = {
        language_tabs: [],

    };

    const markdownOutput = await widdershins.convert(openApiObject, options);

    return markdownOutput;
}
