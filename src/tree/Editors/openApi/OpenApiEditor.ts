// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import * as vscode from "vscode";
import { ProgressLocation, window } from "vscode";
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { ApiCenterApiVersionDefinitionImport, ApiSpecExportResultFormat } from "../../../azure/ApiCenter/contracts";
import { showSavePromptConfigKey } from "../../../constants";
import { UiStrings } from "../../../uiStrings";
import { GeneralUtils } from "../../../utils/generalUtils";
import { ApiVersionDefinitionTreeItem } from "../../ApiVersionDefinitionTreeItem";
import { Editor, EditorOptions } from "../Editor";
export class OpenApiEditor extends Editor<ApiVersionDefinitionTreeItem> {
    constructor() {
        super(showSavePromptConfigKey);
    }

    public async getData(treeItem: ApiVersionDefinitionTreeItem): Promise<string> {
        const exportedSpec = await treeItem.apiCenterApiVersionDefinition.getDefinitions(treeItem?.subscription!, treeItem?.apiCenterName!, treeItem?.apiCenterApiName!, treeItem?.apiCenterApiVersionName!);
        if (exportedSpec.format === ApiSpecExportResultFormat.inline) {
            return exportedSpec.value;
        } else {
            let rawData = GeneralUtils.fetchDataFromLink(exportedSpec.value);
            return rawData;
        }
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
                title: UiStrings.UploadingSpec,
                cancellable: false
            },
            // tslint:disable-next-line:no-non-null-assertion
            async () => {

                const importPayload: ApiCenterApiVersionDefinitionImport = {
                    format: "inline",
                    value: data.toString(),
                    specification: {
                        name: treeItem.apiCenterApiVersionDefinition.getSpecificationName()
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
            window.showInformationMessage(UiStrings.SpecUploaded);
            return this.getData(treeItem);
        });
    }
    public async getFilename(treeItem: ApiVersionDefinitionTreeItem, options: EditorOptions): Promise<string> {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}-${treeItem.apiCenterApiVersionName}-${treeItem.apiCenterApiVersionDefinition.getName()}-tempFile${options.fileType}`;
    }

    public async getDiffFilename(treeItem: ApiVersionDefinitionTreeItem, options: EditorOptions): Promise<string> {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}-${treeItem.apiCenterApiVersionName}-${treeItem.apiCenterApiVersionDefinition.getName()}-diff${options.fileType}`;
    }

    public async getSaveConfirmationText(treeItem: ApiVersionDefinitionTreeItem): Promise<string> {
        return vscode.l10n.t(UiStrings.SavingWillUpdate, treeItem.apiCenterApiVersionDefinition.getName());
    }

    public getSize(context: ApiVersionDefinitionTreeItem): Promise<number> {
        throw new Error(UiStrings.MethodNotImplemented);
    }
}
