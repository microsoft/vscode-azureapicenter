// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export type GeneralApiCenter = ApiCenter | DataPlaneApiCenter;

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
};

export type GeneralApiCenterApi = ApiCenterApi | DataPlaneApiCenterApi;

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
};

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
};

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

export type ApiCenterAnalyzerConfig = {
    id: string;
    type: string;
    name: string;
    properties: {
    };
};

export type ApiCenterAnalyzerConfigs = {
    value: ApiCenterAnalyzerConfig[];
};

export type DataPlaneApiCenterApiVersionDefinition = {
    name: string;
    title: string;
    specification: {
        name: string;
    }
};

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

export type ApiCenterRulesetImportStatus = {
    id: string;
    name: string;
    status: ArmAsyncOperationStatus;
    properties: {
        comment?: string;
    };
};

export type ApiCenterRulesetImportResult = {
    isSuccessful: boolean;
    message?: string | null;
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

export enum ArmAsyncOperationStatus {
    NotStarted = 'NotStarted',
    InProgress = 'InProgress',
    Succeeded = 'Succeeded',
    Failed = 'Failed',
    Canceled = 'Canceled',
}

export enum ApiCenterRulesetImportFormat {
    InlineZip = 'inline-zip',
};

export type ApiCenterApiAccess = {
    id: string;
    name: string;
    properties: {
    };
    // tslint:disable-next-line:no-reserved-keywords
    type: string;
};
