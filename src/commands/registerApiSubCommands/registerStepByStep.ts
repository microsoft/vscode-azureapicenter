// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import * as vscode from 'vscode';
import { ApiCenterService } from "../../azure/ApiCenter/ApiCenterService";
import { ApiCenterApi, ApiCenterApiVersion, ApiCenterApiVersionDefinition, ApiCenterApiVersionDefinitionImport, ApiKind, ApiVersionLifecycleStage, SpecificationName, isApiServerManagement } from "../../azure/ApiCenter/contracts";
import { ext } from "../../extensionVariables";
import { ApiCenterTreeItem } from "../../tree/ApiCenterTreeItem";
import { ApisTreeItem } from "../../tree/ApisTreeItem";
import { UiStrings } from "../../uiStrings";

export async function registerStepByStep(context: IActionContext, node?: ApisTreeItem) {
    if (!node) {
        const apiCenterNode = await ext.treeDataProvider.showTreeItemPicker<ApiCenterTreeItem>(ApiCenterTreeItem.contextValue, context);
        node = apiCenterNode.apisTreeItem;
    }
    if (!(isApiServerManagement(node.apiCenter))) {
        return;
    }

    const apiTitle = await vscode.window.showInputBox({ title: UiStrings.ApiTitle, ignoreFocusOut: true, validateInput: validateInputForTitle });
    if (!apiTitle) {
        return;
    }

    const apiKind = await vscode.window.showQuickPick(Object.values(ApiKind), { title: UiStrings.ApiType, ignoreFocusOut: true });
    if (!apiKind) {
        return;
    }

    const apiVersionTitle = await vscode.window.showInputBox({ title: UiStrings.ApiVersionTitle, ignoreFocusOut: true, validateInput: validateInputForTitle });
    if (!apiVersionTitle) {
        return;
    }

    const apiVersionLifecycleStage = await vscode.window.showQuickPick(Object.values(ApiVersionLifecycleStage), { title: UiStrings.ApiVersionLifecycle, ignoreFocusOut: true });
    if (!apiVersionLifecycleStage) {
        return;
    }

    const apiDefinitionTitle = await vscode.window.showInputBox({ title: UiStrings.ApiDefinitionTitle, ignoreFocusOut: true, validateInput: validateInputForTitle });
    if (!apiDefinitionTitle) {
        return;
    }

    const specificationName = await vscode.window.showQuickPick(Object.values(SpecificationName), { title: UiStrings.ApiSpecificationName, ignoreFocusOut: true });
    if (!specificationName) {
        return;
    }

    const selectFile = await vscode.window.showQuickPick([UiStrings.SelectFile], { title: UiStrings.SelectApiDefinitionFile, ignoreFocusOut: true });
    let filePath = "";
    if (selectFile) {
        const fileUri = await vscode.window.showOpenDialog({ openLabel: UiStrings.Import });
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
        title: UiStrings.RegisterApi
    }, async (progress, token) => {
        progress.report({ message: UiStrings.CreatingApi });
        const apiName = getNameFromTitle(apiTitle);
        const api = {
            name: apiName,
            properties: {
                title: apiTitle,
                kind: apiKind.toLowerCase(),
            }
        };
        validateResponse(await apiCenterService.createOrUpdateApi(api as ApiCenterApi));

        progress.report({ message: UiStrings.CreatingApiVersion });
        const apiVersionName = getNameFromTitle(apiVersionTitle);
        const apiVersion = {
            name: apiVersionName,
            properties: {
                title: apiVersionTitle,
                lifecycleStage: apiVersionLifecycleStage.toLowerCase(),
            }
        };
        validateResponse(await apiCenterService.createOrUpdateApiVersion(apiName, apiVersion as ApiCenterApiVersion));

        progress.report({ message: UiStrings.CreatingApiVersionDefinition });
        const apiDefinitionName = getNameFromTitle(apiDefinitionTitle);
        const apiDefinition = {
            name: apiDefinitionName,
            properties: {
                title: apiDefinitionTitle,
            }
        };
        validateResponse(await apiCenterService.createOrUpdateApiVersionDefinition(apiName, apiVersionName, apiDefinition as ApiCenterApiVersionDefinition));

        progress.report({ message: UiStrings.ImportingApiDefinition });
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
            vscode.window.showInformationMessage(UiStrings.ApiIsRegistered);
        } else {
            throw new Error(UiStrings.FailedToRegisterApi);
        }
    });
}

function getNameFromTitle(title: string) {
    return title.trim().toLocaleLowerCase().replace(/ /g, '-').replace(/[^A-Za-z0-9-]/g, '');
}

function validateInputForTitle(value: string) {
    if (!value) {
        return UiStrings.ValueNotBeEmpty;
    }
    const name = getNameFromTitle(value);
    if (name.length < 2) {
        return UiStrings.ValueAtLeast2Char;
    }
    if (!/[a-zA-Z0-9]/.test(name)) {
        return UiStrings.ValueStartWithAlphanumeric;
    }
}

function validateResponse(response: any) {
    if (response && response.message) {
        throw new Error(response.message);
    }
}
