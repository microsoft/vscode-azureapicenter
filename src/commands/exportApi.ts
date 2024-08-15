// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fs from "fs-extra";

import * as path from "path";
import * as vscode from "vscode";
import { ApiSpecExportResultFormat } from "../azure/ApiCenter/contracts";
import { ApiCenterVersionDefinitionDataPlane, ApiCenterVersionDefinitionManagement } from "../azure/ApiCenterDefines/ApiCenterDefinition";
import { TreeViewType } from "../constants";
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { ApiServerItem } from "../tree/DataPlaneAccount";
import { SubscriptionTreeItem } from "../tree/SubscriptionTreeItem";
import { UiStrings } from "../uiStrings";
import { createTemporaryFolder } from "../utils/fsUtil";
import { GeneralUtils } from "../utils/generalUtils";
export namespace ExportAPI {
    export async function exportApi(
        context: IActionContext,
        node?: ApiVersionDefinitionTreeItem): Promise<void> {
        if (!node) {
            let res = await getDefinitionTreeNode(context);
            if (!res) {
                return;
            }
            node = res;
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
        const folderName = getFolderName(node);
        const folderPath = await createTemporaryFolder(folderName);
        const fileName = getFilename(node);
        const localFilePath: string = path.join(folderPath, fileName);
        await fs.ensureFile(localFilePath);
        const document: vscode.TextDocument = await vscode.workspace.openTextDocument(localFilePath);
        await vscode.workspace.fs.writeFile(vscode.Uri.file(localFilePath), Buffer.from(fileContent));
        await vscode.window.showTextDocument(document);
    }

    async function getDefinitionTreeNode(context: IActionContext): Promise<ApiVersionDefinitionTreeItem | null> {
        const controlViewItem = await ext.dataPlaneTreeDataProvier.getChildren(ext.treeItem)
        const isControlPlaneExist = controlViewItem.some(item => item.contextValue === SubscriptionTreeItem.contextValue);
        const dataViewItem = await ext.treeDataProvider.getChildren(ext.dataPlaneTreeItem);
        const isDataPlaneExist = dataViewItem.some(item => item.contextValue === ApiServerItem.contextValue);
        if (!isControlPlaneExist && !isDataPlaneExist) {
            vscode.window.showInformationMessage(UiStrings.GetTreeView);
            return null;
        }
        if (!isDataPlaneExist) {
            return await ext.treeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(new RegExp(`${ApiCenterVersionDefinitionManagement.contextValue}*`), context);
        }
        if (!isControlPlaneExist) {
            return await ext.dataPlaneTreeDataProvier.showTreeItemPicker<ApiVersionDefinitionTreeItem>(new RegExp(`${ApiCenterVersionDefinitionDataPlane.contextValue}*`), context);
        }
        const viewType = await vscode.window.showQuickPick(Object.values(TreeViewType), { title: UiStrings.SelectItemFromTreeView, ignoreFocusOut: true });
        if (!viewType) {
            return null;
        }
        switch (viewType) {
            case TreeViewType.controlPlaneView:
                return await ext.treeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(new RegExp(`${ApiCenterVersionDefinitionManagement.contextValue}*`), context);
            case TreeViewType.dataPlaneView:
                return await ext.dataPlaneTreeDataProvier.showTreeItemPicker<ApiVersionDefinitionTreeItem>(new RegExp(`${ApiCenterVersionDefinitionDataPlane.contextValue}*`), context);
            default:
                return null;
        }
    }
}
