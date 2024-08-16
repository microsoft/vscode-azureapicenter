// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext, TreeItemIconPath } from '@microsoft/vscode-azext-utils';
import * as path from 'path';
import { window } from "vscode";
import { ApiCenterVersionDefinitionDataPlane, ApiCenterVersionDefinitionManagement } from "../azure/ApiCenterDefines/ApiCenterDefinition";
import { TreeViewType } from "../constants";
import { ext } from '../extensionVariables';
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { ApiServerItem } from "../tree/DataPlaneAccount";
import { SubscriptionTreeItem } from "../tree/SubscriptionTreeItem";
import { UiStrings } from "../uiStrings";
export namespace treeUtils {
    export function getIconPath(iconName: string): TreeItemIconPath {
        return path.join(getResourcesPath(), `${iconName}.svg`);
    }

    export function getThemedIconPath(iconName: string): TreeItemIconPath {
        return {
            light: path.join(getResourcesPath(), 'light', `${iconName}.svg`),
            dark: path.join(getResourcesPath(), 'dark', `${iconName}.svg`)
        };
    }

    function getResourcesPath(): string {
        return ext.context.asAbsolutePath('resources');
    }

    export async function getDefinitionTreeNode(context: IActionContext): Promise<ApiVersionDefinitionTreeItem | null> {
        const controlViewItem = await ext.dataPlaneTreeDataProvider.getChildren(ext.treeItem);
        const isControlPlaneExist = controlViewItem.some(item => item.contextValue === SubscriptionTreeItem.contextValue);
        const dataViewItem = await ext.treeDataProvider.getChildren(ext.dataPlaneTreeItem);
        const isDataPlaneExist = dataViewItem.some(item => item.contextValue === ApiServerItem.contextValue);
        if (!isControlPlaneExist && !isDataPlaneExist) {
            window.showInformationMessage(UiStrings.GetTreeView);
            return null;
        }
        if (!isDataPlaneExist) {
            return await ext.treeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(new RegExp(`${ApiCenterVersionDefinitionManagement.contextValue}*`), context);
        }
        if (!isControlPlaneExist) {
            return await ext.dataPlaneTreeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(new RegExp(`${ApiCenterVersionDefinitionDataPlane.contextValue}*`), context);
        }
        const viewType = await window.showQuickPick(Object.values(TreeViewType), { title: UiStrings.SelectItemFromTreeView, ignoreFocusOut: true });
        if (!viewType) {
            return null;
        }
        switch (viewType) {
            case TreeViewType.controlPlaneView:
                return await ext.treeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(new RegExp(`${ApiCenterVersionDefinitionManagement.contextValue}*`), context);
            case TreeViewType.dataPlaneView:
                return await ext.dataPlaneTreeDataProvider.showTreeItemPicker<ApiVersionDefinitionTreeItem>(new RegExp(`${ApiCenterVersionDefinitionDataPlane.contextValue}*`), context);
            default:
                return null;
        }
    }
}
