// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";

import * as vscode from "vscode";
import { ApiSpecExportResultFormat } from "../azure/ApiCenter/contracts";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
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

        const exportedSpec = await node?.apiCenterApiVersionDefinition.getDefinitions(node?.subscription!, node?.apiCenterName!, node?.apiCenterApiName!, node?.apiCenterApiVersionName!);
        const fileContent = (exportedSpec.format === ApiSpecExportResultFormat.link) ? await GeneralUtils.fetchDataFromLink(exportedSpec.value) : exportedSpec.value;

        const folderName = getFolderName(node);
        const fileName = getFilename(node);

        const fileUri = await writeToTemporaryFile(fileContent, folderName, fileName);

        // TODO
        // 1. Check if TTK is installed
        // 2. Activate TTK
        await vscode.commands.executeCommand("fx-extension.createProjectWithApiSpec", fileUri.fsPath);
    }

    function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
    }

    function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterApiVersionDefinition.getName()}-da-temp`;
    }
}
