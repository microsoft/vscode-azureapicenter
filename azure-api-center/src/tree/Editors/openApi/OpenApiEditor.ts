import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ProgressLocation, window } from "vscode";
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { ApiCenterApiVersionDefinitionImport } from "../../../azure/ApiCenter/contracts";
import { showSavePromptConfigKey } from "../../../constants";
import { localize } from "../../../localize";
import { ApiVersionDefinitionTreeItem } from "../../ApiVersionDefinitionTreeItem";
import { Editor } from "../Editor";

export class OpenApiEditor extends Editor<ApiVersionDefinitionTreeItem> {
    constructor() {
        super(showSavePromptConfigKey);
    }

    public async getData(treeItem: ApiVersionDefinitionTreeItem): Promise<string> {
         const apiCenterService = new ApiCenterService(
            treeItem?.subscription!,
            getResourceGroupFromId(treeItem?.id!),
            treeItem?.apiCenterName!);

        const exportedSpec = await  apiCenterService.exportSpecification(
            treeItem?.apiCenterApiName!,
            treeItem?.apiCenterApiVersionName!,
            treeItem?.apiCenterApiVersionDefinition.name!
        );

        const parsed = JSON.parse(exportedSpec.properties.value);
        return JSON.stringify(parsed, null, 2);
    }

    public async updateData(treeItem: ApiVersionDefinitionTreeItem, data: string): Promise<string> {

        const apiCenterService = new ApiCenterService(
            treeItem?.subscription!,
            getResourceGroupFromId(treeItem?.id!),
            treeItem?.apiCenterName!);

        return window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: "Uploading spec to API Center",
                cancellable: false
            },
            // tslint:disable-next-line:no-non-null-assertion
            async () => {

                const importPayload: ApiCenterApiVersionDefinitionImport =  {
                    format: "inline",
                    value: data.toString(),
                    specificationDetails: {
                        name: "openapi",
                        version: "0.0.1"
                    }
                };

                await  apiCenterService.importSpecification(
                    treeItem?.apiCenterApiName!,
                treeItem?.apiCenterApiVersionName!,
                treeItem?.apiCenterApiVersionDefinition.name!,
                importPayload);
            }
        ).then(async () => {
            // tslint:disable-next-line:no-non-null-assertion
            window.showInformationMessage("Spec uploaded successfully.");

            return this.getData(treeItem);
        });
    }
    public async getFilename(treeItem: ApiVersionDefinitionTreeItem): Promise<string> {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}-${treeItem.apiCenterApiVersionName}--${treeItem.apiCenterApiVersionDefinition.name}-openapi-tempFile.json`;
    }

    public async getDiffFilename(treeItem: ApiVersionDefinitionTreeItem): Promise<string> {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}-${treeItem.apiCenterApiVersionName}--${treeItem.apiCenterApiVersionDefinition.name}-openapi.json`;
    }

    public async getSaveConfirmationText(treeItem: ApiVersionDefinitionTreeItem): Promise<string> {
        return localize("", `Saving will update the API spec '${treeItem.apiCenterApiVersionDefinition.name}'.`);
    }

    public getSize(context: ApiVersionDefinitionTreeItem): Promise<number> {
        throw new Error(localize("", "Method not implemented."));
    }
}
