// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { RequestPrepareOptions, ServiceClient } from "@azure/ms-rest-js";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { getCredentialForToken } from "../../utils/credentialUtil";
import { APICenterRestAPIs } from "./ApiCenterRestAPIs";
import { ApiCenter, ApiCenterApi, ApiCenterApiDeployment, ApiCenterApiVersion, ApiCenterApiVersionDefinition, ApiCenterApiVersionDefinitionExport, ApiCenterApiVersionDefinitionImport, ApiCenterEnvironment, ApiCenterRule } from "./contracts";

export class ApiCenterService {
  private susbcriptionContext: ISubscriptionContext;
  private resourceGroupName: string;
  private apiCenterName: string;
  private apiVersion: string = "2023-07-01-preview";
  private apiVersionPreview: string = "2023-07-01-preview";
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
      url: APICenterRestAPIs.GetAPIService(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, this.apiVersion)
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  public async getApiCenterApis(searchContent: string): Promise<{ value: ApiCenterApi[]; nextLink: string }> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    let url = APICenterRestAPIs.ListAPIs(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, this.apiVersion);
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
      url: APICenterRestAPIs.GetAPIEnvironments(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, this.apiVersion)
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  public async getApiCenterApiVersions(apiName: string): Promise<{ value: ApiCenterApiVersion[]; nextLink: string }> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "GET",
      url: APICenterRestAPIs.GetAPIVersions(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, apiName, this.apiVersion)
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  public async getApiCenterApiDeployments(apiName: string): Promise<{ value: ApiCenterApiDeployment[]; nextLink: string }> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "GET",
      url: APICenterRestAPIs.GetAPIDeployments(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, apiName, this.apiVersion)
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  public async getApiCenterApiVersionDefinitions(apiName: string, apiVersion: string): Promise<{ value: ApiCenterApiVersionDefinition[]; nextLink: string }> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "GET",
      url: APICenterRestAPIs.GetAPIDefinition(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, apiName, apiVersion, this.apiVersion)
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  public async getApiCenterRules(): Promise<{ value: ApiCenterRule; nextLink: string | undefined }> {
    if (new Date().getFullYear() > 2000) {
      return {
        value: {
          id: "",
          location: "",
          name: "Ruleset.yaml",
          functions: [
            {
              id: "",
              location: "",
              name: "infoValueBeHello.js",
              properties: {},
              type: ""
            },
            {
              id: "",
              location: "",
              name: "uniqueOperationId.js",
              properties: {},
              type: ""
            }
          ],
          properties: {
            title: "",
            kind: ""
          },
          type: ""
        },
        nextLink: undefined
      };

    }

    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "GET",
      url: APICenterRestAPIs.GetAPIRules(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, this.apiVersionPreview)
    };
    const response = await client.sendRequest(options);
    return response.parsedBody;
  }

  public async createOrUpdateApi(apiCenterApi: ApiCenterApi): Promise<ApiCenterApi> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "PUT",
      url: APICenterRestAPIs.CreateAPI(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, apiCenterApi.name, this.apiVersion),
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
      url: APICenterRestAPIs.CreateAPIVersion(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, apiName, apiCenterApiVersion.name, this.apiVersion),
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
      url: APICenterRestAPIs.CreateAPIDeployment(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, apiName, apiCenterApiDeployment.name, this.apiVersion),
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
      url: APICenterRestAPIs.CreateAPIDefinition(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, apiName, apiVersionName, apiCenterApiVersionDefinition.name, this.apiVersion),
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
      url: APICenterRestAPIs.ImportAPISpecification(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, apiName, apiVersionName, apiCenterApiVersionDefinitionName, this.apiVersion),
      body: importPayload
    };
    let response = await client.sendRequest(options);

    if (response.status === 200) {
      return true;
    } else if (response.status === 202) {
      const location = response.headers.get("Location");

      if (!location) { return false; }

      options = {
        method: "GET",
        url: location,
      };

      return await this.sendRequestWithTimeout(client, options, 120000); // 2 minutes in milliseconds
    } else {
      return false;
    }
  }

  public async exportSpecification(
    apiName: string,
    apiVersionName: string,
    apiCenterApiVersionDefinitionName: string): Promise<ApiCenterApiVersionDefinitionExport> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ServiceClient(creds);
    const options: RequestPrepareOptions = {
      method: "POST",
      url: APICenterRestAPIs.ExportApiSpecification(this.susbcriptionContext.subscriptionId, this.resourceGroupName, this.apiCenterName, apiName, apiVersionName, apiCenterApiVersionDefinitionName, this.apiVersion),
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
