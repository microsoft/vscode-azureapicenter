// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { ResourceGraphClient } from "@azure/arm-resourcegraph";
import { RequestPrepareOptions, ServiceClient } from "@azure/ms-rest-js";
import * as vscode from 'vscode';
import { ApiCenterApiVersionDefinitionExportWithType } from "../../common/interfaces";
import { getCredentialForToken } from "../../utils/credentialUtil";
import { ApiCenter, ApiCenterApi, ApiCenterApiVersion, ApiCenterApiVersionDefinition, ApiCenterApiVersionDefinitionExport } from "../ApiCenter/contracts";
import { AzureAccountExtensionApi, AzureSubscription } from "./azure-account.api";


export class AzureAccountApi {
    private readonly azureAccountExtensionApi: AzureAccountExtensionApi;
    private apiVersion: string = "2023-07-01-preview";

    constructor() {
        this.azureAccountExtensionApi = vscode.extensions.getExtension<AzureAccountExtensionApi>("ms-vscode.azure-account")!.exports;
    }

    public getFilteredSubscriptions(): AzureSubscription[] {
        const filteredSubscriptions = this.azureAccountExtensionApi.filters;
        return filteredSubscriptions;
    }

    public async getAllSpecifications(): Promise<ApiCenterApiVersionDefinitionExportWithType[]> {
        const subscriptions = this.getFilteredSubscriptions();
        const apiCenters = (await Promise.all(subscriptions.map(async subscription => (await this.getApiCenters(subscription)).map(apiCenter =>
            ({ apiCenter: apiCenter, azureSubscription: subscription })
        )))).flat();
        const apiCentersApis = (await Promise.all(apiCenters.map(async apiCenter => (await this.getApiCenterApis(apiCenter.apiCenter, apiCenter.azureSubscription)).map(apiCenterApi =>
            ({ apiCenterApi: apiCenterApi, apiCenter: apiCenter.apiCenter, azureSubscription: apiCenter.azureSubscription })
        )))).flat();
        const apiCenterApiVersions = (await Promise.all(apiCentersApis.map(async apiCenterApi => (await this.getApiCenterApiVersions(apiCenterApi.apiCenterApi, apiCenterApi.apiCenter, apiCenterApi.azureSubscription)).map(apiCenterApiVersion =>
            ({ apiCenterApiVersion: apiCenterApiVersion, apiCenterApi: apiCenterApi.apiCenterApi, apiCenter: apiCenterApi.apiCenter, azureSubscription: apiCenterApi.azureSubscription })
        )))).flat();
        const apiCenterApiVersionDefinitions = (await Promise.all(apiCenterApiVersions.map(async apiCenterApiVersion => (await this.getApiCenterApiVersionDefinitions(apiCenterApiVersion.apiCenterApiVersion, apiCenterApiVersion.apiCenterApi, apiCenterApiVersion.apiCenter, apiCenterApiVersion.azureSubscription)).map(apiCenterApiVersionDefinition =>
            ({ apiCenterApiVersionDefinition: apiCenterApiVersionDefinition, apiCenterApiVersion: apiCenterApiVersion.apiCenterApiVersion, apiCenterApi: apiCenterApiVersion.apiCenterApi, apiCenter: apiCenterApiVersion.apiCenter, azureSubscription: apiCenterApiVersion.azureSubscription })
        )))).flat();
        const specifications = (await Promise.all(apiCenterApiVersionDefinitions.map(async apiCenterApiVersionDefinition => {
            const specification = await this.exportSpecification(apiCenterApiVersionDefinition.apiCenterApiVersionDefinition, apiCenterApiVersionDefinition.apiCenterApiVersion, apiCenterApiVersionDefinition.apiCenterApi, apiCenterApiVersionDefinition.apiCenter, apiCenterApiVersionDefinition.azureSubscription);
            return {
                format: specification.format,
                value: specification.value,
                type: apiCenterApiVersionDefinition.apiCenterApiVersionDefinition.properties?.specification?.name,
            };
        })));
        return specifications;
    }

    public async getApiCenters(azureSubscription: AzureSubscription): Promise<ApiCenter[]> {
        const query = "resources | where type =~ 'microsoft.apicenter/services'";
        const creds = getCredentialForToken(await azureSubscription.session.credentials2.getToken([]));
        const client = new ResourceGraphClient(creds);

        const response = await client.resources(
            {
                query: query,
                subscriptions: [
                    azureSubscription.subscription.subscriptionId!
                ]
            }
        );


        return response.data;
    }

    public async getApiCenterApis(apiCenter: ApiCenter, azureSubscription: AzureSubscription): Promise<ApiCenterApi[]> {
        const creds = getCredentialForToken(await azureSubscription.session.credentials2.getToken([]));
        const client = new ServiceClient(creds);
        const options: RequestPrepareOptions = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${azureSubscription.subscription.subscriptionId}/resourceGroups/${apiCenter.resourceGroup}/providers/Microsoft.ApiCenter/services/${apiCenter.name}/workspaces/default/apis?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody.value;
    }

    public async getApiCenterApiVersions(apiCenterApi: ApiCenterApi, apiCenter: ApiCenter, azureSubscription: AzureSubscription): Promise<ApiCenterApiVersion[]> {
        const creds = getCredentialForToken(await azureSubscription.session.credentials2.getToken([]));
        const client = new ServiceClient(creds);
        const options: RequestPrepareOptions = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${azureSubscription.subscription.subscriptionId}/resourceGroups/${apiCenter.resourceGroup}/providers/Microsoft.ApiCenter/services/${apiCenter.name}/workspaces/default/apis/${apiCenterApi.name}/versions?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody.value;
    }

    public async getApiCenterApiVersionDefinitions(apiCenterApiVersion: ApiCenterApiVersion, apiCenterApi: ApiCenterApi, apiCenter: ApiCenter, azureSubscription: AzureSubscription): Promise<ApiCenterApiVersionDefinition[]> {
        const creds = getCredentialForToken(await azureSubscription.session.credentials2.getToken([]));
        const client = new ServiceClient(creds);
        const options: RequestPrepareOptions = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${azureSubscription.subscription.subscriptionId}/resourceGroups/${apiCenter.resourceGroup}/providers/Microsoft.ApiCenter/services/${apiCenter.name}/workspaces/default/apis/${apiCenterApi.name}/versions/${apiCenterApiVersion.name}/definitions?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody.value;
    }

    public async exportSpecification(
        apiCenterApiVersionDefinition: ApiCenterApiVersionDefinition,
        apiCenterApiVersion: ApiCenterApiVersion,
        apiCenterApi: ApiCenterApi,
        apiCenter: ApiCenter,
        azureSubscription: AzureSubscription): Promise<ApiCenterApiVersionDefinitionExport> {
        const creds = getCredentialForToken(await azureSubscription.session.credentials2.getToken([]));
        const client = new ServiceClient(creds);
        const options: RequestPrepareOptions = {
            method: "POST",
            url: `https://management.azure.com/subscriptions/${azureSubscription.subscription.subscriptionId}/resourceGroups/${apiCenter.resourceGroup}/providers/Microsoft.ApiCenter/services/${apiCenter.name}/workspaces/default/apis/${apiCenterApi.name}/versions/${apiCenterApiVersion.name}/definitions/${apiCenterApiVersionDefinition.name}/exportSpecification?api-version=${this.apiVersion}`,
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
}
