// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.


import { AzExtParentTreeItem, AzExtTreeItem, GenericTreeItem } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';

/**
 * A TreeDataProvider using AzExtParentTreeItem that contains a GenericTreeItem child node.
 * The child node executes the 'workbench.view.explorer' command when clicked.
 */
export class JumpNodeProvider extends AzExtParentTreeItem {
    public static contextValue: string = 'jumpNodeProvider';
    public contextValue: string = JumpNodeProvider.contextValue;
    public label: string = 'Jump Navigation';

    constructor() {
        // Pass undefined as parent since this is the root
        super(undefined);
    }

    public async loadMoreChildrenImpl(): Promise<AzExtTreeItem[]> {
        // Return a single GenericTreeItem child
        return [
            new GenericTreeItem(this, {
                label: "Jump to API Catalog",
                commandId: 'azure-api-center.jumpToApiCatalog',
                contextValue: "azureCommand",
                id: 'apiCenter.jumpNode',
                iconPath: new vscode.ThemeIcon("link-external"),
            })
        ];
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
}
