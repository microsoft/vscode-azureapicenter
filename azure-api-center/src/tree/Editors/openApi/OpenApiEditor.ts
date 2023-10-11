import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { showSavePromptConfigKey } from "../../../constants";
import { ApiVersionDefinitionTreeItem } from "../../ApiVersionDefinitionTreeItem";
import { Editor } from "../Editor";
import { ApiCenterApiVersionDefinitionImport } from "../../../azure/ApiCenter/contracts";
import { ProgressLocation, window } from "vscode";
import { localize } from "../../../localize";

export class OpenApiEditor extends Editor<ApiVersionDefinitionTreeItem> {
    constructor() {
        super(showSavePromptConfigKey);
    }

    public async getData(context: ApiVersionDefinitionTreeItem): Promise<string> {
         const apiCenterService = new ApiCenterService(
            context?.subscription!, 
            getResourceGroupFromId(context?.id!), 
            context?.apiCenterName!);   

        const exportedSpec = await  apiCenterService.exportSpecification(
            context?.apiCenterApiName!, 
            context?.apiCenterApiVersionName!, 
            context?.apiCenterApiVersionDefinition.name!) 

        const parsed = JSON.parse(exportedSpec.properties.value);
        return JSON.stringify(parsed, null, 2)
    }

    public async updateData(context: ApiVersionDefinitionTreeItem, data: string): Promise<string> {

        const apiCenterService = new ApiCenterService(
            context?.subscription!, 
            getResourceGroupFromId(context?.id!), 
            context?.apiCenterName!);  

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
                    context?.apiCenterApiName!, 
                context?.apiCenterApiVersionName!, 
                context?.apiCenterApiVersionDefinition.name!, 
                importPayload) 
            }
        ).then(async () => {
            // tslint:disable-next-line:no-non-null-assertion
            window.showInformationMessage("Spec uploaded successfully.");

            return this.getData(context);
        });
    }
    public async getFilename(context: ApiVersionDefinitionTreeItem): Promise<string> {
        return `${context.apiCenterName}-${context.apiCenterApiName}-${context.apiCenterApiVersionName}--${context.apiCenterApiVersionDefinition.name}-openapi-tempFile.json`;
    }

    public async getDiffFilename(context: ApiVersionDefinitionTreeItem): Promise<string> {
        return `${context.apiCenterName}-${context.apiCenterApiName}-${context.apiCenterApiVersionName}--${context.apiCenterApiVersionDefinition.name}-openapi.json`;
    }

    public async getSaveConfirmationText(context: ApiVersionDefinitionTreeItem): Promise<string> {
        return localize("", `Saving will update the API spec '${context.apiCenterApiVersionDefinition.name}'.`);
    }
    
    public getSize(context: ApiVersionDefinitionTreeItem): Promise<number> {
        throw new Error(localize("", "Method not implemented."));
    }
}