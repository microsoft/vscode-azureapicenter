// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenterDataPlaneService } from "../ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenterService } from "../ApiCenter/ApiCenterService";
import {
    ApiCenterApi,
    ApiCenterApiDeployment,
    DataPlaneApiCenterApi,
    DataPlaneApiCenterApiDeployment,
    GeneralApiCenterApiDeployment
} from "../ApiCenter/contracts";
export type IDeploymentsBase = {
    getName: () => string;
    _nextLink: string | undefined;
    getNextLink: () => string | undefined;
    getChild: (context: ISubscriptionContext, apiName: string) => Promise<GeneralApiCenterApiDeployment[]>;
    generateChild: (data: GeneralApiCenterApiDeployment) => IDeploymentBase;
};

export class ApiCenterDeploymentsManagement implements IDeploymentsBase {
    constructor(private data: ApiCenterApi) { }
    _nextLink: string | undefined;
    getName(): string {
        return this.data.name;
    }
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    async getChild(context: ISubscriptionContext, apiName: string): Promise<GeneralApiCenterApiDeployment[]> {
        const resourceGroupName = getResourceGroupFromId(this.data.id);
        const apiCenterService = new ApiCenterService(context, resourceGroupName, apiName);
        const apis = await apiCenterService.getApiCenterApiDeployments(this.data.name);
        this._nextLink = apis.nextLink;
        return apis.value;
    }
    generateChild(data: GeneralApiCenterApiDeployment): IDeploymentBase {
        return new ApiCenterDeploymentManagement(data as ApiCenterApiDeployment);
    }
}

export class ApiCenterDeploymentsDataplane implements IDeploymentsBase {
    constructor(private data: DataPlaneApiCenterApi) { }
    getName(): string {
        return this.data.name;
    }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    async getChild(context: ISubscriptionContext, apiName: string): Promise<GeneralApiCenterApiDeployment[]> {
        const server = new ApiCenterDataPlaneService(context);
        const res = await server.listApiDeployments(this.data.name);
        this._nextLink = res.nextLink;
        return res.value;
    }
    generateChild(data: GeneralApiCenterApiDeployment): IDeploymentBase {
        return new ApiCenterDeploymentDataplane(data as DataPlaneApiCenterApiDeployment);
    }
}

export type IDeploymentBase = {
    getId: () => string,
    getName: () => string;
    getRuntimeUris: () => string[];
    getContext: () => string,
};

export class ApiCenterDeploymentManagement implements IDeploymentBase {
    constructor(private data: ApiCenterApiDeployment) { }
    getContext(): string {
        return "azureApiCenterApiDeployment";
    }
    getRuntimeUris(): string[] {
        return this.data.properties.server.runtimeUri;
    }
    getLabel() {
        return this.data.properties.title;
    }
    getId() {
        return this.data.id;
    }
    getName(): string {
        return this.data.name;
    }
}

export class ApiCenterDeploymentDataplane implements IDeploymentBase {
    constructor(private data: DataPlaneApiCenterApiDeployment) { }
    getContext(): string {
        return "azureApiCenterDataPlaneApiDeployment";
    }
    getRuntimeUris(): string[] {
        return this.data.server.runtimeUri;
    }
    getLabel() {
        return this.data.title;
    }
    getId() {
        return this.data.name;
    }
    getName() {
        return this.data.name;
    }
}
