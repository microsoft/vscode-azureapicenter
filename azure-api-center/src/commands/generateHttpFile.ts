import * as SwaggerParser from "@apidevtools/swagger-parser";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as yaml from 'js-yaml';
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { createTemporaryFile } from "../utils/fsUtil";

export async function generateHttpFile(actionContext: IActionContext, node?: ApiVersionDefinitionTreeItem) {
    try {
        const definitionFileRaw = await ext.openApiEditor.getData(node!);
        const swaggerObject = pasreDefinitionFileRawToSwaggerObject(definitionFileRaw);
        const api = await SwaggerParser.parse(swaggerObject);
        const httpFileContent = pasreSwaggerObjectToHttpFileContent(api);
        await writeToHttpFile(node!, httpFileContent);
        console.log(api);
    } catch (error) {
        console.log(error);
    }
}

function pasreDefinitionFileRawToSwaggerObject(input: string) {
    let result = input;

    try {
        // Attempt to parse as JSON
        result = JSON.parse(input);
    } catch (jsonError) {
        try {
            // Attempt to parse as YAML
            result = yaml.load(input) as any;
        } catch (yamlError) { }
    }

    return result;
}

function pasreSwaggerObjectToHttpFileContent(api: any): string {
    const httpRequests: string[] = [];

    for (const path in api.paths) {
        for (const method in api.paths[path]) {
            const request = `${method.toUpperCase()} {{url}}${path}`;
            httpRequests.push(request);
        }
    }

    let httpFileContent = httpRequests.join("\n\n###\n\n");

    if (api.servers?.[0]?.url) {
        let url = api.servers[0].url;
        url = url.endsWith('/') ? url.slice(0, -1) : url;
        httpFileContent = `@url = ${url}\n\n` + httpFileContent;
    }

    return httpFileContent;
}

async function writeToHttpFile(node: ApiVersionDefinitionTreeItem, httpFileContent: string) {
    const fileName = getFilename(node);
    const localFilePath: string = await createTemporaryFile(fileName);
    const document: vscode.TextDocument = await vscode.workspace.openTextDocument(localFilePath);
    await vscode.workspace.fs.writeFile(vscode.Uri.file(localFilePath), Buffer.from(httpFileContent));
    await vscode.window.showTextDocument(document);
}

function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
    return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}-${treeItem.apiCenterApiVersionName}--${treeItem.apiCenterApiVersionDefinition.name}-openapi-tempFile.http`;
}
