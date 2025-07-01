// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenterDataPlaneService } from "../ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenterService } from "../ApiCenter/ApiCenterService";
import {
    ApiCenterApi,
    ApiCenterApiVersion,
    DataPlaneApiCenterApi,
    DataPlaneApiCenterApiVersion,
    GeneralApiCenterApiVersion
} from "../ApiCenter/contracts";
import { ApiCenterVersionDefinitionsDataplane, ApiCenterVersionDefinitionsManagement, IDefinitionsBase } from "./ApiCenterDefinition";
export type IVersionsBase = {
    getName: () => string;
    _nextLink: string | undefined;
    getNextLink: () => string | undefined;
    getChild: (context: ISubscriptionContext, apiName: string) => Promise<GeneralApiCenterApiVersion[]>;
    generateChild: (data: GeneralApiCenterApiVersion) => IVersionBase;
};

export class ApiCenterVersionsManagement implements IVersionsBase {
    constructor(private data: ApiCenterApi) { }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
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
    getName(): string {
        return this.data.name;
    }
}

export class ApiCenterVersionsDataplane implements IVersionsBase {
    constructor(private data: DataPlaneApiCenterApi) { }
    getName(): string {
        return this.data.name;
    }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
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
}

export type IVersionBase = {
    getLabel: () => string,
    getId: () => string,
    getName: () => string,
    generateChild: () => IDefinitionsBase;
    getLifeCycle: () => string;
};

export class ApiCenterVersionManagement implements IVersionBase {
    constructor(private data: ApiCenterApiVersion) { }
    getLifeCycle(): string {
        return this.data.properties.lifecycleStage || "";
    }
    getName(): string {
        return this.data.name;
    }
    generateChild(): IDefinitionsBase {
        return new ApiCenterVersionDefinitionsManagement(this.data);
    }
    getLabel() {
        return this.data.properties.title;
    }
    getId() {
        return this.data.id;
    }
};

export class ApiCenterVersionDataplane implements IVersionBase {
    constructor(private data: DataPlaneApiCenterApiVersion) { }
    getLifeCycle(): string {
        return this.data.lifecycleStage || "";
    }
    getName(): string {
        return this.data.name;
    }
    generateChild(): IDefinitionsBase {
        return new ApiCenterVersionDefinitionsDataplane(this.data);
    }
    getLabel() {
        return this.data.name;
    }
    getId() {
        return this.data.name;
    }
};
