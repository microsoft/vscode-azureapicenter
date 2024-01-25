import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import { OpenDialogOptions, ProgressLocation, Uri, window } from "vscode";
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenterApiVersionDefinitionImport } from "../azure/ApiCenter/contracts";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";

export async function importOpenApi(
    context: IActionContext,
    node?: ApiVersionDefinitionTreeItem,
    importUsingLink: boolean = false): Promise<void> {

    const apiCenterService = new ApiCenterService(
        node?.subscription!,
        getResourceGroupFromId(node?.id!),
        node?.apiCenterName!);

    if (!importUsingLink) {
        const uris = await askDocument(context);
        const uri = uris[0];
        const fileContent = await fse.readFile(uri.fsPath);
        window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: "Uploading spec to API Center",
                cancellable: false
            },
            // tslint:disable-next-line:no-non-null-assertion
            async () => {

                const importPayload: ApiCenterApiVersionDefinitionImport = {
                    format: "inline",
                    value: fileContent.toString(),
                    specification: {
                        name: "openapi",
                        version: "0.0.1"
                    }
                };

                return apiCenterService.importSpecification(
                    node?.apiCenterApiName!,
                    node?.apiCenterApiVersionName!,
                    node?.apiCenterApiVersionDefinition.name!,
                    importPayload);
            }
        ).then(async () => {
            // tslint:disable-next-line:no-non-null-assertion
            await node!.refresh(context);
            window.showInformationMessage("Spec uploaded successfully.");
        });

    } else {
        const openApiLink = await askLink(context);
        window.withProgress(
            {
                location: ProgressLocation.Notification,
                title: "Uploading spec to API Center",
                cancellable: false
            },
            // tslint:disable-next-line:no-non-null-assertion
            async () => {

                const importPayload: ApiCenterApiVersionDefinitionImport = {
                    format: "link",
                    value: openApiLink,
                    specification: {
                        name: "openapi",
                        version: "0.0.1"
                    }
                };

                return apiCenterService.importSpecification(
                    node?.apiCenterApiName!,
                    node?.apiCenterApiVersionName!,
                    node?.apiCenterApiVersionDefinition.name!,
                    importPayload);
            }
        ).then(async () => {
            // tslint:disable-next-line:no-non-null-assertion
            await node!.refresh(context);
            window.showInformationMessage("Spec uploaded successfully.");
        });

    }

}

async function askDocument(context: IActionContext): Promise<Uri[]> {
    const openDialogOptions: OpenDialogOptions = {
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: "Import",
        filters: {
            JSON: ["json"]
        }
    };
    return await context.ui.showOpenDialog(openDialogOptions);
}

async function askLink(context: IActionContext): Promise<string> {
    const promptStr: string = 'Specify a OpenAPI 2.0 or 3.0 link.';
    return (await context.ui.showInputBox({
        prompt: promptStr,
        placeHolder: 'https://',
        validateInput: async (value: string): Promise<string | undefined> => {
            value = value ? value.trim() : '';
            const regexp = /http(s?):\/\/[\d\w][\d\w]*(\.[\d\w][\d\w-]*)*(:\d+)?(\/[\d\w-\.\?,'/\\\+&amp;=:%\$#_]*)?/;
            const isUrlValid = regexp.test(value);
            if (!isUrlValid) {
                return "Provide a valid link. example - https://petstore.swagger.io/v2/swagger.json";
            } else {
                return undefined;
            }
        }
    })).trim();
}
