// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { IActionContext, UserCancelledError } from "@microsoft/vscode-azext-utils";
import { JSONSchemaFaker } from 'json-schema-faker';
import { OpenAPIV3 } from "openapi-types";
import * as vscode from 'vscode';
import { ApiCenterService } from "../azure/ApiCenter/ApiCenterService";
import { ApiCenterApiAccess, ApiCenterAuthConfig } from "../azure/ApiCenter/contracts";
import { ext } from "../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../tree/ApiVersionDefinitionTreeItem";
import { UiStrings } from "../uiStrings";
import { EnsureExtension } from "../utils/ensureExtension";
import { writeToTemporaryFile } from "../utils/fsUtil";
import { OpenApiUtils } from "../utils/openApiUtils";

export namespace GenerateHttpFile {
    interface ApiKeySecuritySchemes {
        [key: string]: OpenAPIV3.ApiKeySecurityScheme;
    };
    interface ApiKeySecuritySchemesWithValue {
        [key: string]: OpenAPIV3.ApiKeySecurityScheme & { value: string };
    };

    export async function generateHttpFile(context: IActionContext, node?: ApiVersionDefinitionTreeItem) {
        const definitionFileRaw = await ext.openApiEditor.getData(node!);
        const api = await OpenApiUtils.pasreDefinitionFileRawToOpenAPIV3FullObject(definitionFileRaw);
        const httpFileContent = await pasreSwaggerObjectToHttpFileContent(api, node!);
        await writeToHttpFile(node!, httpFileContent);

        EnsureExtension.ensureExtension(context, {
            extensionId: 'humao.rest-client',
            noExtensionErrorMessage: UiStrings.NoRestClientExtension,
        });
    }

    export async function pasreSwaggerObjectToHttpFileContent(api: OpenAPIV3.Document, node: ApiVersionDefinitionTreeItem): Promise<string> {
        const apiKeySecuritySchemes = getApiKeySecuritySchemes(api);
        const apiKeySecuritySchemesWithValue = await getApiKeySecuritySchemesWithValue(apiKeySecuritySchemes, node!);
        return pasreSwaggerObjectToHttpFileContentWithAuth(api, apiKeySecuritySchemesWithValue);
    }

    function getApiKeySecuritySchemes(api: OpenAPIV3.Document): ApiKeySecuritySchemes {
        return Object.fromEntries(
            Object.entries(api.components?.securitySchemes || {}).filter(
                ([, scheme]) => (scheme as OpenAPIV3.SecuritySchemeObject).type === 'apiKey'
            )
        ) as ApiKeySecuritySchemes;
    }

    async function getApiKeySecuritySchemesWithValue(apiKeySecuritySchemes: ApiKeySecuritySchemes, node: ApiVersionDefinitionTreeItem): Promise<ApiKeySecuritySchemesWithValue> {
        const apiCenterService = new ApiCenterService(node?.subscription!, getResourceGroupFromId(node?.id!), node?.apiCenterName!);
        const [{ value: accesses }, { value: authConfigs }] = await Promise.all([
            apiCenterService.getApiCenterApiAccesses(node.apiCenterApiName, node.apiCenterApiVersionName),
            apiCenterService.getApiCenterAuthConfigs()
        ]);

        const accessesWithAuthConfig: (ApiCenterApiAccess & ApiCenterAuthConfig)[] = [];

        for (const access of accesses) {
            const authConfig = authConfigs.find(authConfig => authConfig.id.endsWith(access.properties.authConfigResourceId));

            if (authConfig) {
                access.properties = { ...access.properties, ...authConfig.properties };
                accessesWithAuthConfig.push(access as (ApiCenterApiAccess & ApiCenterAuthConfig));
            }
        }

        if (accessesWithAuthConfig.length === 0) {
            return {};
        }

        const apiKeySecuritySchemesWithValue: ApiKeySecuritySchemesWithValue = {};

        for (const key in apiKeySecuritySchemes) {
            const apiKeySecurityScheme = apiKeySecuritySchemes[key];

            const filteredAccesses = accessesWithAuthConfig.filter(access => access.properties.apiKey?.name === apiKeySecurityScheme.name && access.properties.apiKey?.in === apiKeySecurityScheme.in);
            let accessName: string = "";

            if (filteredAccesses.length === 1) {
                accessName = filteredAccesses[0].name;
            } else if (filteredAccesses.length > 1) {
                const selectedAccess = await vscode.window.showQuickPick(
                    filteredAccesses.map(access => ({
                        label: access.name,
                        description: access.properties.title,
                        detail: access.properties.description,
                        value: access
                    })) as (vscode.QuickPickItem & { value: ApiCenterApiAccess })[],
                    { placeHolder: `Select security requirement for "${apiKeySecurityScheme.name}"` }
                );
                if (selectedAccess) {
                    accessName = selectedAccess.value.name;
                } else {
                    throw new UserCancelledError();
                }
            }

            if (accessName) {
                const credential = await apiCenterService.getApiCenterApiCredential(node.apiCenterApiName, node.apiCenterApiVersionName, accessName);
                const credentialValue = credential.apiKey?.value;
                if (credentialValue) {
                    apiKeySecuritySchemesWithValue[key] = { ...apiKeySecurityScheme, value: credentialValue };
                }
            }
        }

        return apiKeySecuritySchemesWithValue;
    }

    function pasreSwaggerObjectToHttpFileContentWithAuth(api: OpenAPIV3.Document, apiKeySecuritySchemesWithValue: ApiKeySecuritySchemesWithValue): string {
        const httpRequests: string[] = [];
        const variableNames = new Set<string>();

        for (const path in api.paths) {
            const pathWithVariables = parsePath(path, variableNames);

            for (const method in api.paths[path]) {
                if (Object.values(OpenAPIV3.HttpMethods).map(m => m.toString()).includes(method)) {
                    const operation: OpenAPIV3.OperationObject = (api.paths[path] as any)[method];
                    const parameters = operation.parameters as (OpenAPIV3.ParameterObject[] | undefined);

                    let queryString = parseQueryString(parameters, variableNames);
                    let header = parseHeader(parameters, variableNames);

                    ({ header, queryString } = parseSecurity(header, queryString, operation.security || api.security || [], apiKeySecuritySchemesWithValue));

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

    function parseSecurity(header: string, queryString: string, securityRequirementObject: OpenAPIV3.SecurityRequirementObject[], apiKeySecuritySchemesWithValue: ApiKeySecuritySchemesWithValue): { header: string, queryString: string } {
        for (const security of securityRequirementObject) {
            if (Object.keys(security).every(key => key in apiKeySecuritySchemesWithValue)) {
                for (const key in security) {
                    const apiKeySecurityScheme = apiKeySecuritySchemesWithValue[key];
                    const apiKeyName = apiKeySecurityScheme.name;
                    const apiKeyValue = apiKeySecurityScheme.value;
                    if (apiKeySecurityScheme.in === "header") {
                        if (header) {
                            header += `\n${apiKeyName}: ${apiKeyValue}`;
                        } else {
                            header = `${apiKeyName}: ${apiKeyValue}`;
                        }
                    } else if (apiKeySecurityScheme.in === "query") {
                        if (queryString) {
                            queryString += `&${apiKeyName}=${apiKeyValue}`;
                        } else {
                            queryString = `?${apiKeyName}=${apiKeyValue}`;
                        }
                    }
                }
                break; // Pick the first set of security schemes
            }
        };

        return { header, queryString };
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
