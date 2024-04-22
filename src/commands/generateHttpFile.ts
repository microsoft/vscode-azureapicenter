// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as fse from 'fs-extra';
import { JSONSchemaFaker } from 'json-schema-faker';
import { OpenAPIV3 } from "openapi-types";
import * as path from 'path';
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { UiStrings } from "../uiStrings";
import { ensureExtension } from "../utils/ensureExtension";
import { createTemporaryFolder } from "../utils/fsUtil";
import { pasreDefinitionFileRawToOpenAPIV3FullObject } from "../utils/openApiUtils";

export async function generateHttpFile(context: IActionContext, node?: ApiVersionDefinitionTreeItem) {
    const definitionFileRaw = await ext.openApiEditor.getData(node!);
    const api = await pasreDefinitionFileRawToOpenAPIV3FullObject(definitionFileRaw);
    const httpFileContent = pasreSwaggerObjectToHttpFileContent(api);
    await writeToHttpFile(node!, httpFileContent);

    ensureExtension(context, {
        extensionId: 'humao.rest-client',
        noExtensionErrorMessage: UiStrings.NoRestClientExtension,
    });
}

function pasreSwaggerObjectToHttpFileContent(api: OpenAPIV3.Document): string {
    const httpRequests: string[] = [];

    for (const path in api.paths) {
        for (const method in api.paths[path]) {
            if (Object.values(OpenAPIV3.HttpMethods).map(m => m.toString()).includes(method)) {
                const operation: OpenAPIV3.OperationObject = (api.paths[path] as any)[method];
                const parameters = operation.parameters as (OpenAPIV3.ParameterObject[] | undefined);

                const queryString = parseQueryString(parameters);
                let header = parseHeader(parameters);
                const body = parseBody(operation.requestBody as (OpenAPIV3.RequestBodyObject | undefined));

                if (body) {
                    const jsonContentType = "Content-Type: application/json";
                    if (header) {
                        header += "\n" + jsonContentType;
                    } else {
                        header = jsonContentType;
                    }
                }

                const request = `${method.toUpperCase()} {{url}}${path}${queryString} HTTP/1.1
${header}

${body}`;

                httpRequests.push(request.trimEnd());
            }
        }
    }

    const httpRequestsContent = httpRequests.join("\n\n###\n\n");

    let url = "";
    if (api.servers?.[0]?.url) {
        url = api.servers[0].url;
        url = url.endsWith('/') ? url.slice(0, -1) : url;
    }

    const httpFileContent = `@url = ${url}

${httpRequestsContent}`;

    return httpFileContent;
}

function parseQueryString(parameters: OpenAPIV3.ParameterObject[] | undefined): string {
    const queryStrings = parseParameter(parameters, "query");
    let queryStringString = queryStrings.map(q => `${q.name}=${parseValueFromParameterObject(q)}`).join("&");
    if (queryStringString) {
        queryStringString = "?" + queryStringString;
    }
    return queryStringString;
}

function parseHeader(parameters: OpenAPIV3.ParameterObject[] | undefined): string {
    const headers = parseParameter(parameters, "header");
    const headerString = headers.map(h => `${h.name}: ${parseValueFromParameterObject(h)}`).join("\n");
    return headerString;
}

function parseParameter(parameters: OpenAPIV3.ParameterObject[] | undefined, inValue: string): OpenAPIV3.ParameterObject[] {
    const filteredParameters = parameters?.filter(p => p.in === inValue);
    return filteredParameters ?? [];
}

function parseValueFromParameterObject(parameterObject: OpenAPIV3.ParameterObject): any {
    if (parameterObject.example) {
        return parameterObject.example;
    }

    const schema = parameterObject.schema as OpenAPIV3.SchemaObject;
    if (schema) {
        if (schema.example) {
            return schema.example;
        }
        if (schema.default) {
            return schema.default;
        }
    }

    return `{${parameterObject.name}}`;
}

function parseBody(requestBody: OpenAPIV3.RequestBodyObject | undefined): string {
    const jsonBodySchema = requestBody?.content?.["application/json"]?.schema as OpenAPIV3.SchemaObject;
    if (jsonBodySchema) {
        let body: { [key: string]: any } = {};
        if (jsonBodySchema.example) {
            body = jsonBodySchema.example;
        } else if (jsonBodySchema.default) {
            body = jsonBodySchema.default;
        } else if (jsonBodySchema.properties) {
            for (const name in jsonBodySchema.properties) {
                const propertySchema = jsonBodySchema.properties[name] as OpenAPIV3.SchemaObject;
                if (propertySchema.example) {
                    body[name] = propertySchema.example;
                } else if (propertySchema.default) {
                    body[name] = propertySchema.default;
                }
            }
        }
        if (Object.keys(body).length === 0) {
            body = JSONSchemaFaker.generate(jsonBodySchema) as { [key: string]: any };
        }
        if (Object.keys(body).length > 0) {
            return JSON.stringify(body, null, 2);
        }
    }
    return "";
}

async function writeToHttpFile(node: ApiVersionDefinitionTreeItem, httpFileContent: string) {
    const folderName = getFolderName(node);
    const folderPath = await createTemporaryFolder(folderName);
    const fileName = getFilename(node);
    const localFilePath: string = path.join(folderPath, fileName);
    await fse.ensureFile(localFilePath);
    const document: vscode.TextDocument = await vscode.workspace.openTextDocument(localFilePath);
    await vscode.workspace.fs.writeFile(vscode.Uri.file(localFilePath), Buffer.from(httpFileContent));
    await vscode.window.showTextDocument(document);
}

function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
    return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
}

function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
    return `${treeItem.apiCenterApiVersionName}-tempFile.http`;
}
