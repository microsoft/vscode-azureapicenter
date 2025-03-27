// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzureSubscriptionProvider } from "@microsoft/vscode-azext-azureauth";
import { AzExtParentTreeItem, AzExtTreeDataProvider, IAzExtLogOutputChannel } from "@microsoft/vscode-azext-utils";
import { ExtensionContext } from "vscode";
import { DataPlaneAccount } from "./azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiVersionDefinitionTreeItem } from "./tree/ApiVersionDefinitionTreeItem";
import { OpenApiEditor } from "./tree/Editors/openApi/OpenApiEditor";
/**
 * Namespace for common variables used throughout the extension. They must be initialized in the activate() method of extension.ts
 */

export namespace ext {
    export let prefix: string = 'azureAPICenter';

    export let context: ExtensionContext;
    export let treeItem: AzExtParentTreeItem & { dispose(): unknown; };
    export let treeDataProvider: AzExtTreeDataProvider;
    export let outputChannel: IAzExtLogOutputChannel;
    export let openApiEditor: OpenApiEditor;
    export let selectedApiVersionDefinitionTreeItem: ApiVersionDefinitionTreeItem;

    export let dataPlaneAccounts: DataPlaneAccount[];
    export let dataPlaneTreeDataProvider: AzExtTreeDataProvider;
    export let dataPlaneTreeItem: AzExtParentTreeItem & { dispose(): unknown; };

    export let subscriptionProviderFactory: () => Promise<AzureSubscriptionProvider>;
}
