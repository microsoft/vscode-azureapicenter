// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import { ApiVersionDefinitionsTreeItem } from "../tree/ApiVersionDefinitionsTreeItem";
import { OpenDialogOptions, ProgressLocation, Uri, window, workspace } from "vscode";
import { ext } from "../extensionVariables";
import * as fse from 'fs-extra';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { ApiCenterApiVersionDefinitionImport } from "../azure/ApiCenter/contracts";

export async function exportOpenApi(
    context: IActionContext, 
    node?: ApiVersionDefinitionTreeItem): Promise<void> {

        const apiCenterService = new ApiCenterService(
            node?.subscription!, 
            getResourceGroupFromId(node?.id!), 
            node?.apiCenterName!);   

        const exportedSpec = await  apiCenterService.exportSpecification(
                node?.apiCenterApiName!, 
                node?.apiCenterApiVersionName!, 
                node?.apiCenterApiVersionDefinition.name!); 
}
