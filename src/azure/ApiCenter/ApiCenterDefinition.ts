// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenterDataPlaneService } from "../ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenterService } from "../ApiCenter/ApiCenterService";
import {
    ApiCenter,
    ApiCenterApi,
    ApiCenterApiVersion,
    ApiCenterApiVersionDefinition,
    ApiCenterApiVersionDefinitionExport,
    DataPlaneApiCenter,
    DataPlaneApiCenterApi,
    DataPlaneApiCenterApiVersion,
    DataPlaneApiCenterApiVersionDefinition,
    GeneralApiCenterApi,
    GeneralApiCenterApiVersion,
    GeneralApiCenterApiVersionDefinition
} from "./contracts";

export type IApiCenterServiceBase = {
    _nextLink: string | undefined;
    getNextLink: () => string | undefined;
    getName: () => string,
    getId: () => string,
    getChild: (context: ISubscriptionContext, content: string) => Promise<GeneralApiCenterApi[]>;
    generateChild: (data: GeneralApiCenterApi) => IApiCenterBase;
};

export class ApiCenterServiceManagement implements IApiCenterServiceBase {
    constructor(public data: ApiCenter) { }
    getName(): string {
        return this.data.name;
    }
    getId(): string {
        return this.data.id;
    }
    async getChild(context: ISubscriptionContext, content: string): Promise<GeneralApiCenterApi[]> {
        const resourceGroupName = getResourceGroupFromId(this.data.id);
        const apiCenterService = new ApiCenterService(context, resourceGroupName, this.data.name);
        const apis = await apiCenterService.getApiCenterApis(content);
        this._nextLink = apis.nextLink;
        return apis.value;
    }
    generateChild(data: GeneralApiCenterApi): IApiCenterBase {
        return new ApiCenterApiManagement(data as ApiCenterApi);
    }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
    }
};

export class ApiCenterServiceDataPlane implements IApiCenterServiceBase {
    constructor(public data: DataPlaneApiCenter) { }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    getName(): string {
        return this.data.name;
    }
    getId(): string {
        return this.data.name;
    }
    async getChild(context: ISubscriptionContext, content: string): Promise<GeneralApiCenterApi[]> {
        let server = new ApiCenterDataPlaneService(context);
        const res = await server.getApiCenterApis();
        this._nextLink = res.nextLink;
        return res.value;
    }
    generateChild(data: GeneralApiCenterApi): IApiCenterBase {
        return new ApiCenterApiDataPlane(data as DataPlaneApiCenterApi);
    }
};

export type IApiCenterBase = {
    _nextLink: string | undefined;
    getNextLink: () => string | undefined;
    getName: () => string,
    getId: () => string,
    getLable: () => string;
    getChild: (context: ISubscriptionContext, apiName: string) => Promise<GeneralApiCenterApiVersion[]>;
    generateChild: (data: GeneralApiCenterApiVersion) => IVersionBase;
};

export class ApiCenterApiManagement implements IApiCenterBase {
    constructor(public data: ApiCenterApi) { }
    getData(): ApiCenterApi {
        return this.data;
    }
    getName(): string {
        return this.data.name;
    }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    getId(): string {
        return this.data.id;
    }
    getLable(): string {
        return this.data.properties.title;
    }
    async getChild(context: ISubscriptionContext, apiName: string): Promise<GeneralApiCenterApiVersion[]> {
        const resourceGroupName = getResourceGroupFromId(this.data.id);
        const apiCenterService = new ApiCenterService(context, resourceGroupName, apiName);
        const apis = await apiCenterService.getApiCenterApiVersions(this.data.name);
        this._nextLink = apis.nextLink;
        return apis.value;
    }
    generateChild(data: GeneralApiCenterApiVersion): IVersionBase {
        return new ApiCenterVersionManagement(data as ApiCenterApiVersion);
    }
};

export class ApiCenterApiDataPlane implements IApiCenterBase {
    constructor(public data: DataPlaneApiCenterApi) { }
    getLable(): string {
        return this.data.name;
    }
    getId(): string {
        return this.data.name;
    }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    getName(): string {
        return this.data.name;
    }
    async getChild(context: ISubscriptionContext, apiName: string): Promise<GeneralApiCenterApiVersion[]> {
        const server = new ApiCenterDataPlaneService(context);
        const res = await server.getAPiCenterApiVersions(this.data.name);
        this._nextLink = res.nextLink;
        return res.value;
    }
    generateChild(data: GeneralApiCenterApiVersion): IVersionBase {
        return new ApiCenterVersionDataplane(data as DataPlaneApiCenterApiVersion);
    }
};

export type IVersionBase = {
    _nextLink: string | undefined;
    getNextLink: () => string | undefined;
    getLable: () => string,
    getId: () => string,
    getName: () => string,
    getChild: (context: ISubscriptionContext, apiName: string, apiServiceName: string) => Promise<GeneralApiCenterApiVersionDefinition[]>;
    generateChild: (data: GeneralApiCenterApiVersionDefinition) => IDefinitionBase;
};

export class ApiCenterVersionManagement implements IVersionBase {
    constructor(public data: ApiCenterApiVersion) { }
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    _nextLink: string | undefined;
    getName(): string {
        return this.data.name;
    }
    generateChild(data: GeneralApiCenterApiVersionDefinition): IDefinitionBase {
        return new ApiCenterVersionDefinitionManagement(data as ApiCenterApiVersionDefinition);
    }
    async getChild(context: ISubscriptionContext, apiName: string, apiServiceName: string): Promise<ApiCenterApiVersionDefinition[]> {
        const resourceGroupName = getResourceGroupFromId(this.data.id);
        const apiCenterService = new ApiCenterService(context, resourceGroupName, apiName);

        const definitions = await apiCenterService.getApiCenterApiVersionDefinitions(apiServiceName, this.data.name);
        this._nextLink = definitions.nextLink;
        return definitions.value;
    };
    getLable() {
        return this.data.properties.title;
    }
    getId() {
        return this.data.id;
    }
};

export class ApiCenterVersionDataplane implements IVersionBase {
    constructor(public data: DataPlaneApiCenterApiVersion) { }
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    _nextLink: string | undefined;
    getName(): string {
        return this.data.name;
    }
    generateChild(data: GeneralApiCenterApiVersionDefinition): IDefinitionBase {
        return new ApiCenterVersionDefinitionDataPlane(data as DataPlaneApiCenterApiVersionDefinition);
    }
    async getChild(context: ISubscriptionContext, apiName: string, apiServiceName: string): Promise<DataPlaneApiCenterApiVersionDefinition[]> {
        const server = new ApiCenterDataPlaneService(context);
        const res = await server.getApiCenterApiDefinitions(apiServiceName, this.data.name);
        this._nextLink = res.nextLink;
        return res.value;
    }
    getLable() {
        return this.data.name;
    }
    getId() {
        return this.data.name;
    }
};

export type IDefinitionBase = {
    getLabel: () => string,
    getId: () => string,
    getContext: () => string,
    getName: () => string;
    getDefinitions: (context: ISubscriptionContext, apiServiceName: string, apiName: string, apiVersionName: string) => Promise<ApiCenterApiVersionDefinitionExport>;
};

export class ApiCenterVersionDefinitionManagement implements IDefinitionBase {
    constructor(public data: ApiCenterApiVersionDefinition) { }
    async getDefinitions(context: ISubscriptionContext, apiServiceName: string, apiName: string, apiVersionName: string): Promise<ApiCenterApiVersionDefinitionExport> {
        const resourceGroupName = getResourceGroupFromId(this.data.id);
        const apiCenterService = new ApiCenterService(
            context,
            resourceGroupName,
            apiServiceName);
        const exportedSpec = await apiCenterService.exportSpecification(
            apiName,
            apiVersionName,
            this.data.name);
        return exportedSpec;
    }
    static contextValue: string = "azureApiCenterApiVersionDefinitionTreeItem";
    getName(): string {
        return this.data.name;
    };
    getContext() {
        return ApiCenterVersionDefinitionManagement.contextValue + "-" + this.data.properties.specification.name.toLowerCase();
    };
    getLabel() {
        return this.data.properties.title;
    };
    getId() {
        return this.data.id;
    };
};

export class ApiCenterVersionDefinitionDataPlane implements IDefinitionBase {
    constructor(public data: DataPlaneApiCenterApiVersionDefinition) { }
    async getDefinitions(context: ISubscriptionContext, apiServiceName: string, apiName: string, apiVersionName: string): Promise<ApiCenterApiVersionDefinitionExport> {
        let server = new ApiCenterDataPlaneService(context);
        let results = await server.exportSpecification(apiName,
            apiVersionName, this.data.name);
        return results;
    };
    static contextValue: string = "azureApiCenterApiVersionDataPlaneDefinitionTreeItem";
    getName(): string {
        return this.data.name;
    };
    getContext() {
        return ApiCenterVersionDefinitionDataPlane.contextValue + "-" + this.data.specification.name.toLowerCase();
    };
    getLabel() {
        return this.data.name;
    };
    getId() {
        return this.data.name;
    };
};
