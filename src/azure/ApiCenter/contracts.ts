// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export type GeneralApiCenter = ApiCenter | DataPlaneApiCenter;
export function isApiServerManagement(obj: GeneralApiCenter): obj is ApiCenter {
    const keys = Object.keys(obj) as (keyof ApiCenter)[];
    return (keys.length === Object.keys({} as ApiCenter).length) && keys.every(key => key in obj);
}
export type ApiCenter = {
    id: string;
    location: string;
    name: string;
    resourceGroup: string;
    properties: {
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};

export type DataPlaneApiCenter = {
    name: string;
}

export type GeneralApiCenterApi = ApiCenterApi | DataPlaneApiCenterApi;
export function isApiManagement(obj: GeneralApiCenterApi): obj is ApiCenterApi {
    const keys = Object.keys(obj) as (keyof ApiCenterApi)[];
    return (keys.length === Object.keys({} as ApiCenterApi).length) && keys.every(key => key in obj);
}
export type ApiCenterApi = {
    id: string;
    location: string;
    name: string;
    properties: {
        title: string;
        kind: string;
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};

export type DataPlaneApiCenterApi = {
    name: string;
    title: string;
    kind: string;
    lifecycleStage: string;
    externalDocumentation: [];
    contacts: [];
    customProperties: {};
}

export type ApiCenterEnvironment = {
    id: string;
    location: string;
    name: string;
    properties: {
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};

export type GeneralApiCenterApiVersion = ApiCenterApiVersion | DataPlaneApiCenterApiVersion;
export function isApiVersionManagement(obj: GeneralApiCenterApiVersion): obj is ApiCenterApiVersion {
    const keys = Object.keys(obj) as (keyof ApiCenterApiVersion)[];
    return (keys.length === Object.keys({} as ApiCenterApiVersion).length) && keys.every(key => key in obj);
}
export type ApiCenterApiVersion = {
    id: string;
    location: string;
    name: string;
    properties: {
        title: string;
        lifecycleStage: string;
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};

export type DataPlaneApiCenterApiVersion = {
    name: string;
    title: string;
    lifecycleStage: string;
}

export type ApiCenterApiDeployment = {
    id: string;
    location: string;
    name: string;
    properties: {
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};

export type GeneralApiCenterApiVersionDefinition = ApiCenterApiVersionDefinition | DataPlaneApiCenterApiVersionDefinition;

export function isDefinitionManagement(obj: GeneralApiCenterApiVersionDefinition): obj is ApiCenterApiVersionDefinition {
    const keys = Object.keys(obj) as (keyof ApiCenterApiVersionDefinition)[];
    return (keys.length === Object.keys({} as ApiCenterApiVersionDefinition).length) && keys.every(key => key in obj);
}

export type ApiCenterApiVersionDefinition = {
    id: string;
    location: string;
    name: string;
    properties: {
        title: string;
        specification: {
            name: string;
            version: string;
        }
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};

export type ApiCenterRulesetConfig = {
    properties: {
    };
};
export type DataPlaneApiCenterApiVersionDefinition = {
    name: string;
    title: string;
    specification: {
        name: string;
    }
}

export type ApiCenterApiVersionDefinitionImport = {
    format: string;
    value: string;
    specification: {
        name: string
        version: string
    }
};

export type ApiCenterApiVersionDefinitionExport = {
    format: string;
    value: string;
};

export type ApiCenterRulesetImport = {
    format: string;
    value: string;
};

export type ApiCenterRulesetExport = {
    format: string;
    value: string;
};

export enum ApiKind {
    rest = 'REST',
    graphql = 'GraphQL',
    grpc = 'gRPC',
    soap = 'SOAP',
    webhook = 'Webhook',
    websocket = 'WebSocket',
};

export enum ApiVersionLifecycleStage {
    design = 'Design',
    development = 'Development',
    testing = 'Testing',
    preview = 'Preview',
    production = 'Production',
    deprecated = 'Deprecated',
    retired = 'Retired',
}

export enum SpecificationName {
    openapi = 'OpenAPI',
    wsdl = 'WSDL',
    wadl = 'WADL',
    graphql = 'GraphQL',
    grpc = 'gRPC',
    asyncapi = 'AsyncAPI',
    raml = 'RAML',
    other = 'Other',
};

export enum ApiSpecExportResultFormat {
    inline = 'inline',
    link = 'link',
};
