import * as SwaggerParser from "@apidevtools/swagger-parser";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as yaml from 'js-yaml';
import { OpenAPIV3 } from "openapi-types";
import * as converter from "swagger2openapi";
import * as vscode from 'vscode';
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { createTemporaryFile } from "../utils/fsUtil";

export async function generateHttpFile(actionContext: IActionContext, node?: ApiVersionDefinitionTreeItem) {
    try {
        const definitionFileRaw = await ext.openApiEditor.getData(node!);
        const swaggerObject = pasreDefinitionFileRawToSwaggerObject(definitionFileRaw);
        const swaggerObjectV3 = await convertToOpenAPIV3(swaggerObject);
        const api = (await SwaggerParser.dereference(swaggerObjectV3)) as OpenAPIV3.Document;
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

async function convertToOpenAPIV3(swaggerObject: any): Promise<OpenAPIV3.Document> {
    const swaggerObjectV3 = await converter.convert(swaggerObject, {});
    return swaggerObjectV3.openapi;
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

    let httpFileContent = httpRequests.join("\n\n###\n\n");

    if (api.servers?.[0]?.url) {
        let url = api.servers[0].url;
        url = url.endsWith('/') ? url.slice(0, -1) : url;
        httpFileContent = `@url = ${url}\n\n` + httpFileContent;
    }

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
        } else if (jsonBodySchema.properties) {
            for (const name in jsonBodySchema.properties) {
                const propertySchema = jsonBodySchema.properties[name] as OpenAPIV3.SchemaObject;
                body[name] = propertySchema.example;
            }
        }
        if (Object.keys(body).length > 0) {
            return JSON.stringify(body, null, 2);
        }
    }
    return "";
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
