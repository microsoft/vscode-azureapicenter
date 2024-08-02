// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ProgressLocation, window } from "vscode";
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { ApiCenterApiVersionDefinitionImport } from "../../../azure/ApiCenter/contracts";
import { showSavePromptConfigKey } from "../../../constants";
import { localize } from "../../../localize";
import { ApiVersionDefinitionTreeItem } from "../../ApiVersionDefinitionTreeItem";
import { Editor, EditorOptions } from "../Editor";

export class OpenApiEditor extends Editor<ApiVersionDefinitionTreeItem> {
    constructor() {
        super(showSavePromptConfigKey);
    }

    public async getData(treeItem: ApiVersionDefinitionTreeItem): Promise<string> {
        const exportedSpec = await treeItem.apiCenterApiVersionDefinition.getDefinitions(treeItem?.subscription!, treeItem?.apiCenterName!, treeItem?.apiCenterApiName!, treeItem?.apiCenterApiVersionName!);
        return exportedSpec.value;
    }

    public async updateData(treeItem: ApiVersionDefinitionTreeItem, data: string): Promise<string> {
        const apiCenterService = new ApiCenterService(
            treeItem?.subscription!,
            getResourceGroupFromId(treeItem?.id!),
            treeItem?.apiCenterName!
        );

        return window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: "Uploading spec to API Center",
                cancellable: false
            },
            // tslint:disable-next-line:no-non-null-assertion
            async () => {

                const importPayload: ApiCenterApiVersionDefinitionImport = {
                    format: "inline",
                    value: data.toString(),
                    specification: {
                        name: "openapi", // TODO: we need to change this right?
                        version: "0.0.1" // TODO: we need to change this right?
                    }
                };

                await apiCenterService.importSpecification(
                    treeItem?.apiCenterApiName!,
                    treeItem?.apiCenterApiVersionName!,
                    treeItem?.apiCenterApiVersionDefinition.getName(),
                    importPayload
                );
            }
        ).then(async () => {
            window.showInformationMessage("Spec uploaded successfully.");
            return this.getData(treeItem);
        });
    }
    public async getFilename(treeItem: ApiVersionDefinitionTreeItem, options: EditorOptions): Promise<string> {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}-${treeItem.apiCenterApiVersionName}--${treeItem.apiCenterApiVersionDefinition.getName()}-openapi-tempFile${options.fileType}`;
    }

    public async getDiffFilename(treeItem: ApiVersionDefinitionTreeItem, options: EditorOptions): Promise<string> {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}-${treeItem.apiCenterApiVersionName}--${treeItem.apiCenterApiVersionDefinition.getName()}-openapi.json${options.fileType}`;
    }

    public async getSaveConfirmationText(treeItem: ApiVersionDefinitionTreeItem): Promise<string> {
        return localize("", `Saving will update the API spec '${treeItem.apiCenterApiVersionDefinition.getName()}'.`);
    }

    public getSize(context: ApiVersionDefinitionTreeItem): Promise<number> {
        throw new Error(localize("", "Method not implemented."));
    }
}
