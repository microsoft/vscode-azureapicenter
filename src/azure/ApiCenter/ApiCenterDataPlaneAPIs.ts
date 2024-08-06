// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { RequestPrepareOptions, ServiceClient } from "@azure/ms-rest-js";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenterApiVersionDefinitionExport, DataPlaneApiCenterApi, DataPlaneApiCenterApiVersion, DataPlaneApiCenterApiVersionDefinition } from "../ApiCenter/contracts";
import { APICenterDataPlaneRestAPIs } from "./ApiCenterRestAPIs";
export interface DataPlaneAccount {
    readonly domain: string;
    readonly tenantId: string;
    readonly clientId: string;
}
export class ApiCenterDataPlaneService {
    private susbcriptionContext: ISubscriptionContext;
    constructor(susbcriptionContext: ISubscriptionContext) {
        this.susbcriptionContext = susbcriptionContext;
    };
    public async getApiCenterApis(): Promise<{ value: DataPlaneApiCenterApi[]; nextLink: string }> {
        const client = new ServiceClient(this.susbcriptionContext.credentials);
        let url = APICenterDataPlaneRestAPIs.ListApis(this.susbcriptionContext.subscriptionPath);
        const options: RequestPrepareOptions = {
            method: "GET",
            url: url,
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    };
    public async getAPiCenterApiVersions(apiName: string): Promise<{ value: DataPlaneApiCenterApiVersion[]; nextLink: string }> {
        const client = new ServiceClient(this.susbcriptionContext.credentials);
        let url = APICenterDataPlaneRestAPIs.ListApiVersions(this.susbcriptionContext.subscriptionPath, apiName);
        const options: RequestPrepareOptions = {
            method: "GET",
            url: url,
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    };
    public async getApiCenterApiDefinitions(apiName: string, apiVersion: string): Promise<{ value: DataPlaneApiCenterApiVersionDefinition[]; nextLink: string }> {
        const client = new ServiceClient(this.susbcriptionContext.credentials);
        let url = APICenterDataPlaneRestAPIs.ListApiDefinitions(this.susbcriptionContext.subscriptionPath, apiName, apiVersion);
        const options: RequestPrepareOptions = {
            method: "GET",
            url: url,
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    };
    public async exportSpecification(apiName: string,
        apiVersionName: string,
        apiCenterApiVersionDefinitionName: string): Promise<ApiCenterApiVersionDefinitionExport> {
        const client = new ServiceClient(this.susbcriptionContext.credentials);
        const options: RequestPrepareOptions = {
            method: "POST",
            url: APICenterDataPlaneRestAPIs.ExportApiDefinitions(this.susbcriptionContext.subscriptionPath, apiName, apiVersionName, apiCenterApiVersionDefinitionName),
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
}
