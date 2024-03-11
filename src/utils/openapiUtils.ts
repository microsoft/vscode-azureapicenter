// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as SwaggerParser from "@apidevtools/swagger-parser";
import * as yaml from 'js-yaml';
import { OpenAPIV3 } from "openapi-types";
import * as converter from "swagger2openapi";

export async function pasreDefinitionFileRawToOpenAPIV3FullObject(definitionFileRaw: string): Promise<OpenAPIV3.Document> {
    const swaggerObject = pasreDefinitionFileRawToSwaggerObject(definitionFileRaw);
    const swaggerObjectV3 = await convertToOpenAPIV3(swaggerObject);
    const api = (await SwaggerParser.dereference(swaggerObjectV3)) as OpenAPIV3.Document;

    return api;
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

export function compressOpenAPIV3(api: OpenAPIV3.Document): OpenAPIV3.Document {
    const compressedApi = JSON.parse(JSON.stringify(api)) as OpenAPIV3.Document;
    for (const path in api.paths) {
        for (const method in api.paths[path]) {
            const operation: OpenAPIV3.OperationObject = (api.paths[path] as any)[method];
            (compressedApi.paths[path] as any)[method] = {
                summary: operation.summary,
                description: operation.description,
                operationId: operation.operationId,
            };
        }
    }
    return compressedApi;
}
