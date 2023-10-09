
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenter, ApiCenterApi, ApiCenterApiDeployment, ApiCenterApiVersion, ApiCenterApiVersionDefinition, ApiCenterEnvironment } from "./contracts";
import { ServiceClient, RequestPrepareOptions } from "@azure/ms-rest-js";
import { getCredentialForToken } from "../../utils/credentialUtil";

export class ApiCenterService { 
    private susbcriptionContext: ISubscriptionContext; 
    private resourceGroupName: string;
    private apiCenterName: string;
    private apiVersion: string = "2023-07-01-preview";
    constructor(susbcriptionContext: ISubscriptionContext, resourceGroupName: string, apiCenterName: string) {
        this.susbcriptionContext = susbcriptionContext;
        this.apiCenterName = apiCenterName;
        this.resourceGroupName = resourceGroupName; 
    }

    public async getApiCenter(): Promise<ApiCenter> {
      const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
      const client = new ServiceClient(creds);
      const options: RequestPrepareOptions = {
        method: "GET",
        url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}?api-version=${this.apiVersion}`
      };
      const response = await client.sendRequest(options);
      return response.parsedBody;
    }

    public async getApiCenterApis(): Promise< {value: ApiCenterApi[]; nextLink: string }> {
      const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
      const client = new ServiceClient(creds);
      const options: RequestPrepareOptions = {
        method: "GET",
        url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis?api-version=${this.apiVersion}`
      };
      const response = await client.sendRequest(options);
      return response.parsedBody;
    }

    public async getApiCenterEnvironments(): Promise< {value: ApiCenterEnvironment[]; nextLink: string }> {
      const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
      const client = new ServiceClient(creds);
      const options: RequestPrepareOptions = {
        method: "GET",
        url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/environments?api-version=${this.apiVersion}`
      };
      const response = await client.sendRequest(options);
      return response.parsedBody;
    }

    public async getApiCenterApiVersions(apiName: string): Promise< {value: ApiCenterApiVersion[]; nextLink: string }> {
      const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
      const client = new ServiceClient(creds);
      const options: RequestPrepareOptions = {
        method: "GET",
        url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions?api-version=${this.apiVersion}`
      };
      const response = await client.sendRequest(options);
      return response.parsedBody;
    }

    public async getApiCenterApiDeployments(apiName: string): Promise< {value: ApiCenterApiDeployment[]; nextLink: string }> {
      const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
      const client = new ServiceClient(creds);
      const options: RequestPrepareOptions = {
        method: "GET",
        url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/deployments?api-version=${this.apiVersion}`
      };
      const response = await client.sendRequest(options);
      return response.parsedBody;
    }

    public async getApiCenterApiVersionDefinitions(apiName: string, apiVersion: string): Promise< {value: ApiCenterApiVersionDefinition[]; nextLink: string }> {  
      const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
      const client = new ServiceClient(creds);
      const options: RequestPrepareOptions = {
        method: "GET",
        url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions/${apiVersion}/definitions?api-version=${this.apiVersion}`
      };
      const response = await client.sendRequest(options);
      return response.parsedBody;
    }

    public async createOrUpdateApi(apiCenterApi: ApiCenterApi): Promise<ApiCenterApi> {
      const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
      const client = new ServiceClient(creds);
      const options: RequestPrepareOptions = {
        method: "PUT",
        url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiCenterApi.name}?api-version=${this.apiVersion}`,
        body: apiCenterApi.properties
      };
      const response = await client.sendRequest(options);
      return response.parsedBody;
    }

    public async createOrUpdateApiVersion(apiCenterApiVersion: ApiCenterApiVersion): Promise<ApiCenterApiVersion> {
      const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
      const client = new ServiceClient(creds);
      const options: RequestPrepareOptions = {
        method: "GET",
        url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis?api-version=${this.apiVersion}`
      };
      const response = await client.sendRequest(options);
      return response.parsedBody;
    }

    public async createOrUpdateApiVersionDefinition(apiCenterApiVersionDefinition: ApiCenterApiVersionDefinition): Promise<ApiCenterApiVersionDefinition> {
      const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
      const client = new ServiceClient(creds);
      const options: RequestPrepareOptions = {
        method: "GET",
        url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis?api-version=${this.apiVersion}`
      };
      const response = await client.sendRequest(options);
      return response.parsedBody;
    }
}