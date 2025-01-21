// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";

import * as vscode from "vscode";
import { ApiSpecExportResultFormat } from "../azure/ApiCenter/contracts";
import { TeamsToolkitExtensionId } from "../constants";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { EnsureExtension } from "../utils/ensureExtension";
import { writeToTemporaryFile } from "../utils/fsUtil";
import { GeneralUtils } from "../utils/generalUtils";
import { treeUtils } from "../utils/treeUtils";

export namespace CreateDeclarativeAgent {
    export async function createDeclarativeAgent(context: IActionContext, node?: ApiVersionDefinitionTreeItem): Promise<void> {
        if (!node) {
            node = await treeUtils.getDefinitionTreeNode(context);
        }
        if (!node) {
            return;
        }

        const fileUri = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
        }, async (progress, token): Promise<vscode.Uri> => {
            EnsureExtension.ensureExtension(context, {
                extensionId: TeamsToolkitExtensionId,
                noExtensionErrorMessage: "Need to instal Teams Toolkit extension to create a Declarative Agent",
            });

            progress.report({ message: "Activating Teams Toolkit" });
            await vscode.extensions.getExtension(TeamsToolkitExtensionId)?.activate();

            progress.report({ message: "Exporting API Definition" });
            const exportedSpec = await node!.apiCenterApiVersionDefinition.getDefinitions(node!.subscription, node!.apiCenterName, node!.apiCenterApiName, node!.apiCenterApiVersionName);
            const fileContent = (exportedSpec.format === ApiSpecExportResultFormat.link) ? await GeneralUtils.fetchDataFromLink(exportedSpec.value) : exportedSpec.value;

            const folderName = getFolderName(node!);
            const fileName = getFilename(node!);

            return await writeToTemporaryFile(fileContent, folderName, fileName);
        });

        await vscode.commands.executeCommand("fx-extension.createProjectWithApiSpec", fileUri.fsPath);
    }

    function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
    }

    function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterApiVersionDefinition.getName()}-da-temp`;
    }
}
