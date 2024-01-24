import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenterApi, ApiCenterApiVersion, ApiCenterApiVersionDefinition, ApiCenterApiVersionDefinitionImport, ApiKind, ApiVersionLifecycleStage, SpecificationName } from "../azure/ApiCenter/contracts";
import { ext } from "../extensionVariables";
import { ApiCenterTreeItem } from "../tree/ApiCenterTreeItem";
import { ApisTreeItem } from "../tree/ApisTreeItem";

export async function registerApi(context: IActionContext, node?: ApisTreeItem) {
    if (!node) {
        const apiCenterNode = await ext.treeDataProvider.showTreeItemPicker<ApiCenterTreeItem>(ApiCenterTreeItem.contextValue, context);
        node = apiCenterNode.apisTreeItem;
    }

    const apiTitle = await vscode.window.showInputBox({ title: 'API Title', ignoreFocusOut: true, validateInput: validateInputForTitle });
    if (!apiTitle) {
        return;
    }

    const apiKind = await vscode.window.showQuickPick(Object.values(ApiKind), { title: 'API Type', ignoreFocusOut: true });
    if (!apiKind) {
        return;
    }

    const apiVersionTitle = await vscode.window.showInputBox({ title: 'API Version Title', ignoreFocusOut: true, validateInput: validateInputForTitle });
    if (!apiVersionTitle) {
        return;
    }

    const apiVersionLifecycleStage = await vscode.window.showQuickPick(Object.values(ApiVersionLifecycleStage), { title: 'API Version Lifecycle', ignoreFocusOut: true });
    if (!apiVersionLifecycleStage) {
        return;
    }

    const apiDefinitionTitle = await vscode.window.showInputBox({ title: 'API Definition Title', ignoreFocusOut: true, validateInput: validateInputForTitle });
    if (!apiDefinitionTitle) {
        return;
    }

    const specificationName = await vscode.window.showQuickPick(Object.values(SpecificationName), { title: 'API Specification Name', ignoreFocusOut: true });
    if (!specificationName) {
        return;
    }

    const selectFile = await vscode.window.showQuickPick(["Select File"], { title: 'Select API Definition File To Import', ignoreFocusOut: true });
    let filePath = "";
    if (selectFile) {
        const fileUri = await vscode.window.showOpenDialog({ openLabel: "Import" });
        if (fileUri && fileUri[0]) {
            filePath = fileUri[0].fsPath;
        } else {
            return;
        }
    } else {
        return;
    }

    const resourceGroupName = getResourceGroupFromId(node.apiCenter.id);
    const apiCenterService = new ApiCenterService(node.parent?.subscription!, resourceGroupName, node.apiCenter.name);

    await createApiResources(apiCenterService, apiTitle, apiKind, apiVersionTitle, apiVersionLifecycleStage,
        apiDefinitionTitle, specificationName, filePath);

    node.refresh(context);
}

async function createApiResources(apiCenterService: ApiCenterService, apiTitle: string, apiKind: string,
    apiVersionTitle: string, apiVersionLifecycleStage: string, apiDefinitionTitle: string, specificationName: string, filePath: string) {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Register API"
    }, async (progress, token) => {
        progress.report({ message: "Creating API..." });
        const apiName = getNameFromTitle(apiTitle);
        const api = {
            name: apiName,
            properties: {
                title: apiTitle,
                kind: apiKind.toLowerCase(),
            }
        };
        validateResponse(await apiCenterService.createOrUpdateApi(api as ApiCenterApi));

        progress.report({ message: "Creating API Version..." });
        const apiVersionName = getNameFromTitle(apiVersionTitle);
        const apiVersion = {
            name: apiVersionName,
            properties: {
                title: apiVersionTitle,
                lifecycleStage: apiVersionLifecycleStage.toLowerCase(),
            }
        };
        validateResponse(await apiCenterService.createOrUpdateApiVersion(apiName, apiVersion as ApiCenterApiVersion));

        progress.report({ message: "Creating API Definition..." });
        const apiDefinitionName = getNameFromTitle(apiDefinitionTitle);
        const apiDefinition = {
            name: apiDefinitionName,
            properties: {
                title: apiDefinitionTitle,
            }
        };
        validateResponse(await apiCenterService.createOrUpdateApiVersionDefinition(apiName, apiVersionName, apiDefinition as ApiCenterApiVersionDefinition));

        progress.report({ message: "Importing API Definition..." });
        const fileContent = await fse.readFile(filePath);
        const importPayload = {
            format: "inline",
            value: fileContent.toString(),
            specification: {
                name: specificationName.toLowerCase(),
            }
        };

        const result = await apiCenterService.importSpecification(
            apiName,
            apiVersionName,
            apiDefinitionName,
            importPayload as ApiCenterApiVersionDefinitionImport);

        if (result) {
            vscode.window.showInformationMessage("API is registered.");
        } else {
            throw new Error("Failed to register API.");
        }
    });
}

function getNameFromTitle(title: string) {
    return title.trim().toLocaleLowerCase().replace(/ /g, '-').replace(/[^A-Za-z0-9-]/g, '');
}

function validateInputForTitle(value: string) {
    if (!value) {
        return "The value should not be empty.";
    }
    const name = getNameFromTitle(value);
    if (name.length < 2) {
        return "The value should have at least 2 characters of numbers or letters.";
    }
    if (!/[a-zA-Z0-9]/.test(name)) {
        return "The value should start with letter or number.";
    }
}

function validateResponse(response: any) {
    if (response && response.message) {
        throw new Error(response.message);
    }
}
