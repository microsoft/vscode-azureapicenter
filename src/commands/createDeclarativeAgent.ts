// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { ApiSpecExportResultFormat } from "../azure/ApiCenter/contracts";
import { TeamsToolkitExtensionId, TeamsToolkitMinimumVersion } from "../constants";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { UiStrings } from "../uiStrings";
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
                noExtensionErrorMessage: vscode.l10n.t(UiStrings.NoTeamsToolkitExtension, TeamsToolkitMinimumVersion),
                minimumVersion: TeamsToolkitMinimumVersion,
            });

            progress.report({ message: UiStrings.ActivatingTeamsToolkit });
            await vscode.extensions.getExtension(TeamsToolkitExtensionId)?.activate();

            progress.report({ message: UiStrings.ExportingApiDefinition });
            const exportedSpec = await node!.apiCenterApiVersionDefinition.getDefinitions(node!.subscription, node!.apiCenterName, node!.apiCenterApiName, node!.apiCenterApiVersionName);
            const fileContent = (exportedSpec.format === ApiSpecExportResultFormat.link) ? await GeneralUtils.fetchDataFromLink(exportedSpec.value) : exportedSpec.value;

            return await CreateDeclarativeAgent.writeApiSpecToTemporaryFile(fileContent, node!);
        });

        await vscode.commands.executeCommand("fx-extension.createDeclarativeAgentWithApiSpec", fileUri.fsPath);
    }

    export async function writeApiSpecToTemporaryFile(fileContent: string, node: ApiVersionDefinitionTreeItem): Promise<vscode.Uri> {
        const folderName = getFolderName(node);
        const fileName = getFilename(node);
        return await writeToTemporaryFile(fileContent, folderName, fileName);
    }

    function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
    }

    function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterApiVersionDefinition.getName()}-da-temp`;
    }
}
