// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { RequestPrepareOptions, ServiceClient } from "@azure/ms-rest-js";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { getCredentialForToken } from "../../utils/credentialUtil";
import { ApiCenter, ApiCenterApi, ApiCenterApiDeployment, ApiCenterApiVersion, ApiCenterApiVersionDefinition, ApiCenterApiVersionDefinitionExport, ApiCenterApiVersionDefinitionImport, ApiCenterEnvironment } from "./contracts";

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

  public async getApiCenterApis(searchContent: string): Promise<{ value: ApiCenterApi[]; nextLink: string }> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    let url = `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis?api-version=${this.apiVersion}`;
    if (searchContent) {
      url += `&$search=${searchContent}`;
    }
    const options: RequestPrepareOptions = {
      method: "GET",
      url: url,
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  public async getApiCenterEnvironments(): Promise<{ value: ApiCenterEnvironment[]; nextLink: string }> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "GET",
      url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/environments?api-version=${this.apiVersion}`
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  public async getApiCenterApiVersions(apiName: string): Promise<{ value: ApiCenterApiVersion[]; nextLink: string }> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "GET",
      url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions?api-version=${this.apiVersion}`
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  public async getApiCenterApiDeployments(apiName: string): Promise<{ value: ApiCenterApiDeployment[]; nextLink: string }> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "GET",
      url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/deployments?api-version=${this.apiVersion}`
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  public async getApiCenterApiVersionDefinitions(apiName: string, apiVersion: string): Promise<{ value: ApiCenterApiVersionDefinition[]; nextLink: string }> {
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
      body: {
        properties: apiCenterApi.properties
      }
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  public async createOrUpdateApiVersion(apiName: string, apiCenterApiVersion: ApiCenterApiVersion): Promise<ApiCenterApiVersion> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "PUT",
      url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions/${apiCenterApiVersion.name}?api-version=${this.apiVersion}`,
      body: {
        properties: apiCenterApiVersion.properties
      }
    };
    const response = await client.sendRequest(options);

    return response.parsedBody;
  }

  public async createOrUpdateApiDeployment(apiName: string, apiCenterApiDeployment: ApiCenterApiDeployment): Promise<ApiCenterApiDeployment> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "PUT",
      url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/deployments/${apiCenterApiDeployment.name}?api-version=${this.apiVersion}`,
      body: apiCenterApiDeployment.properties
    };
    const response = await client.sendRequest(options);

    return response.parsedBody;
  }

  public async createOrUpdateApiVersionDefinition(apiName: string, apiVersionName: string, apiCenterApiVersionDefinition: ApiCenterApiVersionDefinition): Promise<ApiCenterApiVersionDefinition> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "PUT",
      url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions/${apiVersionName}/definitions/${apiCenterApiVersionDefinition.name}?api-version=${this.apiVersion}`,
      body: {
        properties: apiCenterApiVersionDefinition.properties
      }
    };
    const response = await client.sendRequest(options);

    return response.parsedBody;
  }

  public async importSpecification(
    apiName: string,
    apiVersionName: string,
    apiCenterApiVersionDefinitionName: string,
    importPayload: ApiCenterApiVersionDefinitionImport): Promise<boolean> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);

    let options: RequestPrepareOptions = {
      method: "POST",
      url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions/${apiVersionName}/definitions/${apiCenterApiVersionDefinitionName}/importSpecification?api-version=${this.apiVersion}`,
      body: importPayload
    };
    let response = await client.sendRequest(options);

    const location = response.headers.get("Location");

    if (!location) { return false; }

    options = {
      method: "GET",
      url: location,
    };

    return await this.sendRequestWithTimeout(client, options, 120000); // 2 minutes in milliseconds
  }

  public async exportSpecification(
    apiName: string,
    apiVersionName: string,
    apiCenterApiVersionDefinitionName: string): Promise<ApiCenterApiVersionDefinitionExport> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "POST",
      url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions/${apiVersionName}/definitions/${apiCenterApiVersionDefinitionName}/exportSpecification?api-version=${this.apiVersion}`,
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  private async sendRequestWithTimeout(client: ServiceClient, options: RequestPrepareOptions, timeout: number): Promise<boolean> {
    let response = null;
    let startTime = Date.now();
    do {
      response = await client.sendRequest(options);
      if (response.status !== 202) {
        return true;
      }
    } while (Date.now() - startTime < timeout);
    return false;
  }
}
