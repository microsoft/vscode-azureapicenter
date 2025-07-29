// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenterDataPlaneService } from "../ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenterService } from "../ApiCenter/ApiCenterService";
import {
    ApiCenterApiVersion,
    ApiCenterApiVersionDefinition,
    ApiCenterApiVersionDefinitionExport,
    DataPlaneApiCenterApiVersion,
    DataPlaneApiCenterApiVersionDefinition,
    GeneralApiCenterApiVersionDefinition
} from "../ApiCenter/contracts";
export type IDefinitionsBase = {
    getName: () => string;
    _nextLink: string | undefined;
    getNextLink: () => string | undefined;
    getChild: (context: ISubscriptionContext, apiName: string, apiServiceName: string) => Promise<GeneralApiCenterApiVersionDefinition[]>;
    generateChild: (data: GeneralApiCenterApiVersionDefinition) => IDefinitionBase;
};

export class ApiCenterVersionDefinitionsManagement implements IDefinitionsBase {
    constructor(private data: ApiCenterApiVersion) { }
    getName(): string {
        return this.data.name;
    }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
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
}

export class ApiCenterVersionDefinitionsDataplane implements IDefinitionsBase {
    constructor(private data: DataPlaneApiCenterApiVersion) { }
    getName(): string {
        return this.data.name;
    }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    async getChild(context: ISubscriptionContext, apiName: string, apiServiceName: string): Promise<GeneralApiCenterApiVersionDefinition[]> {
        const server = new ApiCenterDataPlaneService(context);
        const res = await server.getApiCenterApiDefinitions(apiServiceName, this.data.name);
        this._nextLink = res.nextLink;
        return res.value;
    }
    generateChild(data: GeneralApiCenterApiVersionDefinition): IDefinitionBase {
        return new ApiCenterVersionDefinitionDataPlane(data as DataPlaneApiCenterApiVersionDefinition);
    }
}

export type IDefinitionBase = {
    getLabel: () => string,
    getId: () => string,
    getContext: () => string,
    getName: () => string;
    getDefinitions: (context: ISubscriptionContext, apiServiceName: string, apiName: string, apiVersionName: string) => Promise<ApiCenterApiVersionDefinitionExport>;
};

export class ApiCenterVersionDefinitionManagement implements IDefinitionBase {
    constructor(private data: ApiCenterApiVersionDefinition) { }
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
    constructor(private data: DataPlaneApiCenterApiVersionDefinition) { }
    async getDefinitions(context: ISubscriptionContext, apiServiceName: string, apiName: string, apiVersionName: string): Promise<ApiCenterApiVersionDefinitionExport> {
        let server = new ApiCenterDataPlaneService(context);
        let results = await server.exportSpecification(apiName, apiVersionName, this.data.name);
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
