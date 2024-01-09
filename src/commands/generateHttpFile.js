"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHttpFile = void 0;
const SwaggerParser = require("@apidevtools/swagger-parser");
const fse = require("fs-extra");
const yaml = require("js-yaml");
const openapi_types_1 = require("openapi-types");
const path = require("path");
const converter = require("swagger2openapi");
const vscode = require("vscode");
const extensionVariables_1 = require("../extensionVariables");
const ensureExtension_1 = require("../utils/ensureExtension");
const fsUtil_1 = require("../utils/fsUtil");
async function generateHttpFile(context, node) {
    const definitionFileRaw = await extensionVariables_1.ext.openApiEditor.getData(node);
    const swaggerObject = pasreDefinitionFileRawToSwaggerObject(definitionFileRaw);
    const swaggerObjectV3 = await convertToOpenAPIV3(swaggerObject);
    const api = (await SwaggerParser.dereference(swaggerObjectV3));
    const httpFileContent = pasreSwaggerObjectToHttpFileContent(api);
    await writeToHttpFile(node, httpFileContent);
    (0, ensureExtension_1.ensureExtension)(context, {
        extensionId: 'humao.rest-client',
        noExtensionErrorMessage: 'Please install the REST Client extension to test APIs with HTTP file.',
    });
}
exports.generateHttpFile = generateHttpFile;
function pasreDefinitionFileRawToSwaggerObject(input) {
    let result = input;
    try {
        // Attempt to parse as JSON
        result = JSON.parse(input);
    }
    catch (jsonError) {
        try {
            // Attempt to parse as YAML
            result = yaml.load(input);
        }
        catch (yamlError) { }
    }
    return result;
}
async function convertToOpenAPIV3(swaggerObject) {
    const swaggerObjectV3 = await converter.convert(swaggerObject, {});
    return swaggerObjectV3.openapi;
}
function pasreSwaggerObjectToHttpFileContent(api) {
    const httpRequests = [];
    for (const path in api.paths) {
        for (const method in api.paths[path]) {
            if (Object.values(openapi_types_1.OpenAPIV3.HttpMethods).map(m => m.toString()).includes(method)) {
                const operation = api.paths[path][method];
                const parameters = operation.parameters;
                const queryString = parseQueryString(parameters);
                let header = parseHeader(parameters);
                const body = parseBody(operation.requestBody);
                if (body) {
                    const jsonContentType = "Content-Type: application/json";
                    if (header) {
                        header += "\n" + jsonContentType;
                    }
                    else {
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
function parseQueryString(parameters) {
    const queryStrings = parseParameter(parameters, "query");
    let queryStringString = queryStrings.map(q => `${q.name}=${parseValueFromParameterObject(q)}`).join("&");
    if (queryStringString) {
        queryStringString = "?" + queryStringString;
    }
    return queryStringString;
}
function parseHeader(parameters) {
    const headers = parseParameter(parameters, "header");
    const headerString = headers.map(h => `${h.name}: ${parseValueFromParameterObject(h)}`).join("\n");
    return headerString;
}
function parseParameter(parameters, inValue) {
    const filteredParameters = parameters?.filter(p => p.in === inValue);
    return filteredParameters ?? [];
}
function parseValueFromParameterObject(parameterObject) {
    if (parameterObject.example) {
        return parameterObject.example;
    }
    const schema = parameterObject.schema;
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
function parseBody(requestBody) {
    const jsonBodySchema = requestBody?.content?.["application/json"]?.schema;
    if (jsonBodySchema) {
        let body = {};
        if (jsonBodySchema.example) {
            body = jsonBodySchema.example;
        }
        else if (jsonBodySchema.properties) {
            for (const name in jsonBodySchema.properties) {
                const propertySchema = jsonBodySchema.properties[name];
                body[name] = propertySchema.example;
            }
        }
        if (Object.keys(body).length > 0) {
            return JSON.stringify(body, null, 2);
        }
    }
    return "";
}
async function writeToHttpFile(node, httpFileContent) {
    const folderName = getFolderName(node);
    const folderPath = await (0, fsUtil_1.createTemporaryFolder)(folderName);
    const fileName = getFilename(node);
    const localFilePath = path.join(folderPath, fileName);
    await fse.ensureFile(localFilePath);
    const document = await vscode.workspace.openTextDocument(localFilePath);
    await vscode.workspace.fs.writeFile(vscode.Uri.file(localFilePath), Buffer.from(httpFileContent));
    await vscode.window.showTextDocument(document);
}
function getFolderName(treeItem) {
    return `${treeItem.apiCenterName}-${treeItem.apiCenterApiName}`;
}
function getFilename(treeItem) {
    return `${treeItem.apiCenterApiVersionName}-tempFile.http`;
}
//# sourceMappingURL=generateHttpFile.js.map