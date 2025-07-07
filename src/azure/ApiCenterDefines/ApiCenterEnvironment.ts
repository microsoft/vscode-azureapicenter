// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { getResourceGroupFromId } from "@microsoft/vscode-azext-azureutils";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenterDataPlaneService } from "../ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenterService } from "../ApiCenter/ApiCenterService";
import { ApiCenter, ApiCenterEnvironment, DataPlaneApiCenter, DataPlaneApiCenterEnvironment, GeneralApiCenterEnvironment } from "../ApiCenter/contracts";
export type IEnvironmentsBase = {
    getName: () => string;
    _nextLink: string | undefined;
    getNextLink: () => string | undefined;
    getChild: (context: ISubscriptionContext, apiName: string) => Promise<GeneralApiCenterEnvironment[]>;
    generateChild: (data: GeneralApiCenterEnvironment) => IEnvironmentBase;
};

export class ApiCenterEnvironmentsManagement implements IEnvironmentsBase {
    constructor(private data: ApiCenter) { }
    _nextLink: string | undefined;
    getId(): string {
        return this.data.id;
    }
    getName(): string {
        return this.data.name;
    }
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    async getChild(context: ISubscriptionContext, apiName: string): Promise<GeneralApiCenterEnvironment[]> {
        const resourceGroupName = getResourceGroupFromId(this.data.id);
        const apiCenterService = new ApiCenterService(context, resourceGroupName, apiName);
        const apis = await apiCenterService.getApiCenterEnvironments();
        this._nextLink = apis.nextLink;
        return apis.value;
    }
    generateChild(data: GeneralApiCenterEnvironment): IEnvironmentBase {
        return new ApiCenterEnvironmentManagement(data as ApiCenterEnvironment);
    }

}

export class ApiCenterEnvironmentsDataplane implements IEnvironmentsBase {
    constructor(private data: DataPlaneApiCenter) { }
    getName(): string {
        return this.data.name;
    }
    _nextLink: string | undefined;
    getNextLink(): string | undefined {
        return this._nextLink;
    }
    async getChild(context: ISubscriptionContext, apiName: string): Promise<GeneralApiCenterEnvironment[]> {
        const server = new ApiCenterDataPlaneService(context);
        const res = await server.listApiEnvironments();
        this._nextLink = res.nextLink;
        return res.value;
    }
    generateChild(data: GeneralApiCenterEnvironment): IEnvironmentBase {
        return new ApiCenterEnvironmentDataplane(data as DataPlaneApiCenterEnvironment);
    }
}

export type IEnvironmentBase = {
    getId: () => string;
    getName: () => string;
    getManagementPortalUris: () => string[];
    getContext: () => string;
    getKind: () => string;
};

export class ApiCenterEnvironmentManagement implements IEnvironmentBase {
    constructor(private data: ApiCenterEnvironment) { }
    getManagementPortalUris(): string[] {
        return this.data.properties.server?.managementPortalUri || [];
    }
    getContext(): string {
        return "azureApiCenterEnvironments";
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
    getKind(): string {
        return this.data.properties.kind || "";
    }
}

export class ApiCenterEnvironmentDataplane implements IEnvironmentBase {
    constructor(private data: DataPlaneApiCenterEnvironment) { }
    getKind(): string {
        return this.data.kind || "";
    }
    getManagementPortalUris(): string[] {
        return this.data.server?.managementPortalUris || [];
    }
    getContext(): string {
        return "azureApiCenterDataPlaneEnvironments";
    }
    getLabel() {
        return this.data.title;
    }
    getId() {
        return this.data.title;
    }
    getName(): string {
        return this.data.name;
    }
}
