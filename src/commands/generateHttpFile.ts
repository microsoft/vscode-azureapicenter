// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import { JSONSchemaFaker } from 'json-schema-faker';
import { OpenAPIV3 } from "openapi-types";
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { UiStrings } from "../uiStrings";
import { ensureExtension } from "../utils/ensureExtension";
import { writeToTemporaryFile } from "../utils/fsUtil";
import { OpenApiUtils } from "../utils/openApiUtils";

export namespace GenerateHttpFile {
    export async function generateHttpFile(context: IActionContext, node?: ApiVersionDefinitionTreeItem) {
        const definitionFileRaw = await ext.openApiEditor.getData(node!);
        const api = await OpenApiUtils.pasreDefinitionFileRawToOpenAPIV3FullObject(definitionFileRaw);
        const httpFileContent = pasreSwaggerObjectToHttpFileContent(api);
        await writeToHttpFile(node!, httpFileContent);

        ensureExtension(context, {
            extensionId: 'humao.rest-client',
            noExtensionErrorMessage: UiStrings.NoRestClientExtension,
        });
    }

    export function pasreSwaggerObjectToHttpFileContent(api: OpenAPIV3.Document): string {
        const httpRequests: string[] = [];
        const variableNames = new Set<string>();

        for (const path in api.paths) {
            const pathWithVariables = parsePath(path, variableNames);

            for (const method in api.paths[path]) {
                if (Object.values(OpenAPIV3.HttpMethods).map(m => m.toString()).includes(method)) {
                    const operation: OpenAPIV3.OperationObject = (api.paths[path] as any)[method];
                    const parameters = operation.parameters as (OpenAPIV3.ParameterObject[] | undefined);

                    const queryString = parseQueryString(parameters, variableNames);
                    let header = parseHeader(parameters, variableNames);
                    const body = parseBody(operation.requestBody as (OpenAPIV3.RequestBodyObject | undefined));

                    if (body) {
                        const jsonContentType = "Content-Type: application/json";
                        if (header) {
                            header += "\n" + jsonContentType;
                        } else {
                            header = jsonContentType;
                        }
                    }

                    const request = `${method.toUpperCase()} {{url}}${pathWithVariables}${queryString} HTTP/1.1
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

        const variablesContent = Array.from(variableNames).map(v => `@${v} = `).join("\n");

        const httpFileContent = `@url = ${url}
${variablesContent}

${httpRequestsContent}`;

        return httpFileContent;
    }

    function parsePath(path: string, variableNames: Set<string>): string {
        const pathWithVariables = path.replace(/{(.*?)}/g, (match, variableName) => {
            variableNames.add(variableName);
            return `{{${variableName}}}`;
        });

        return pathWithVariables;
    }

    function parseQueryString(parameters: OpenAPIV3.ParameterObject[] | undefined, variableNames: Set<string>): string {
        const queryStrings = parseParameter(parameters, "query");
        let queryStringString = queryStrings.map(q => `${q.name}=${parseValueFromParameterObject(q, variableNames)}`).join("&");
        if (queryStringString) {
            queryStringString = "?" + queryStringString;
        }
        return queryStringString;
    }

    function parseHeader(parameters: OpenAPIV3.ParameterObject[] | undefined, variableNames: Set<string>): string {
        const headers = parseParameter(parameters, "header");
        const headerString = headers.map(h => `${h.name}: ${parseValueFromParameterObject(h, variableNames)}`).join("\n");
        return headerString;
    }

    function parseParameter(parameters: OpenAPIV3.ParameterObject[] | undefined, inValue: string): OpenAPIV3.ParameterObject[] {
        const filteredParameters = parameters?.filter(p => p.in === inValue);
        return filteredParameters ?? [];
    }

    function parseValueFromParameterObject(parameterObject: OpenAPIV3.ParameterObject, variableNames: Set<string>): any {
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

        variableNames.add(parameterObject.name);

        return `{{${parameterObject.name}}}`;
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
        const fileName = getFilename(node);

        const fileUri = await writeToTemporaryFile(httpFileContent, folderName, fileName);

        await vscode.window.showTextDocument(fileUri);
    }

    function getFolderName(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
    }

    function getFilename(treeItem: ApiVersionDefinitionTreeItem): string {
        return `${treeItem.apiCenterApiVersionName}-tempFile.http`;
    }
}
