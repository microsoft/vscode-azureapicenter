// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenterDataPlaneService } from "../ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenterService } from "../ApiCenter/ApiCenterService";
import {
    ApiCenter,
    ApiCenterApi,
    DataPlaneApiCenter,
    DataPlaneApiCenterApi,
    GeneralApiCenterApi
} from "../ApiCenter/contracts";
import { ApiCenterDeploymentsDataplane, ApiCenterDeploymentsManagement, IDeploymentsBase } from "./ApiCenterDeployment";
import { ApiCenterVersionsDataplane, ApiCenterVersionsManagement, IVersionsBase } from "./ApiCenterVersion";
export type IApiCenterApisBase = {
    getName: () => string;
    getId: () => string;
    _nextLink: string | undefined;
    getNextLink: () => string | undefined;
    getChild: (context: ISubscriptionContext, content: string) => Promise<GeneralApiCenterApi[]>;
    generateChild: (data: GeneralApiCenterApi) => IApiCenterApiBase;
};

export class ApiCenterApisManagement implements IApiCenterApisBase {
    constructor(private data: ApiCenter) { }
    getId(): string {
        return this.data.id;
    }
    getName(): string {
        return this.data.name;
    }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    async getChild(context: ISubscriptionContext, content: string): Promise<GeneralApiCenterApi[]> {
        const resourceGroupName = getResourceGroupFromId(this.data.id);
        const apiCenterService = new ApiCenterService(context, resourceGroupName, this.data.name);
        const apis = await apiCenterService.getApiCenterApis(content);
        this._nextLink = apis.nextLink;
        return apis.value;
    }
    generateChild(data: GeneralApiCenterApi): IApiCenterApiBase {
        return new ApiCenterApiManagement(data as ApiCenterApi);
    }
}

export class ApiCenterApisDataplane implements IApiCenterApisBase {
    constructor(private data: DataPlaneApiCenter) { }
    getId(): string {
        return this.data.name;
    }
    getName(): string {
        return this.data.name;
    }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    async getChild(context: ISubscriptionContext, content: string): Promise<GeneralApiCenterApi[]> {
        let server = new ApiCenterDataPlaneService(context);
        const res = await server.getApiCenterApis();
        if (res) {
            this._nextLink = res.nextLink;
            return res.value;
        }
        return [];
    }
    generateChild(data: GeneralApiCenterApi): IApiCenterApiBase {
        return new ApiCenterApiDataPlane(data as DataPlaneApiCenterApi);
    }
}

export type IApiCenterApiBase = {
    _nextLink: string | undefined;
    getNextLink: () => string | undefined;
    getName: () => string;
    getId: () => string;
    getLabel: () => string;
    generateVersionChild: () => IVersionsBase;
    generateDeploymentChild: () => IDeploymentsBase;
    getType: () => string;
};

export class ApiCenterApiManagement implements IApiCenterApiBase {
    constructor(private data: ApiCenterApi) { }
    generateDeploymentChild(): IDeploymentsBase {
        return new ApiCenterDeploymentsManagement(this.data);
    }
    getType(): string {
        return this.data.properties.kind || "unknown";
    }
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
    getLabel(): string {
        return this.data.properties.title;
    }
    generateVersionChild(): IVersionsBase {
        return new ApiCenterVersionsManagement(this.data);
    }
};

export class ApiCenterApiDataPlane implements IApiCenterApiBase {
    constructor(private data: DataPlaneApiCenterApi) { }
    getType(): string {
        return this.data.kind || "unknown";
    }
    getLabel(): string {
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
    generateVersionChild(): IVersionsBase {
        return new ApiCenterVersionsDataplane(this.data);
    }
    generateDeploymentChild(): IDeploymentsBase {
        return new ApiCenterDeploymentsDataplane(this.data);
    }
};
