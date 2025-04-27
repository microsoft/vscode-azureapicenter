// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { RequestPrepareOptions, ServiceClient } from "@azure/ms-rest-js";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { clientOptions } from "../../common/clientOptions";
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
        const client = new ServiceClient(this.susbcriptionContext.credentials, clientOptions);
        let url = APICenterDataPlaneRestAPIs.ListApis(this.susbcriptionContext.subscriptionPath);
        const options: RequestPrepareOptions = {
            method: "GET",
            url: url,
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    };
    public async getAPiCenterApiVersions(apiName: string): Promise<{ value: DataPlaneApiCenterApiVersion[]; nextLink: string }> {
        const client = new ServiceClient(this.susbcriptionContext.credentials, clientOptions);
        let url = APICenterDataPlaneRestAPIs.ListApiVersions(this.susbcriptionContext.subscriptionPath, apiName);
        const options: RequestPrepareOptions = {
            method: "GET",
            url: url,
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    };
    public async getApiCenterApiDefinitions(apiName: string, apiVersion: string): Promise<{ value: DataPlaneApiCenterApiVersionDefinition[]; nextLink: string }> {
        const client = new ServiceClient(this.susbcriptionContext.credentials, clientOptions);
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
        const client = new ServiceClient(this.susbcriptionContext.credentials, clientOptions);
        const options: RequestPrepareOptions = {
            method: "POST",
            url: APICenterDataPlaneRestAPIs.ExportApiDefinitions(this.susbcriptionContext.subscriptionPath, apiName, apiVersionName, apiCenterApiVersionDefinitionName),
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    public async listAuthentication(apiName: string, apiVersion: string): Promise<{ value: any[]; nextLink: string }> {
        const client = new ServiceClient(this.susbcriptionContext.credentials, clientOptions);
        let url = APICenterDataPlaneRestAPIs.ListAuthentication(this.susbcriptionContext.subscriptionPath, apiName, apiVersion);
        const options: RequestPrepareOptions = {
            method: "GET",
            url: url,
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    };
}
