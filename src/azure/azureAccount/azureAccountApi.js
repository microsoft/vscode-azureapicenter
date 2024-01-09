"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureAccountApi = void 0;
const arm_resourcegraph_1 = require("@azure/arm-resourcegraph");
const ms_rest_js_1 = require("@azure/ms-rest-js");
const vscode = require("vscode");
const credentialUtil_1 = require("../../utils/credentialUtil");
class AzureAccountApi {
    constructor() {
        this.apiVersion = "2023-07-01-preview";
        this.azureAccountExtensionApi = vscode.extensions.getExtension("ms-vscode.azure-account").exports;
    }
    getFilteredSubscriptions() {
        const filteredSubscriptions = this.azureAccountExtensionApi.filters;
        return filteredSubscriptions;
    }
    async getAllSpecifications() {
        const subscriptions = this.getFilteredSubscriptions();
        const apiCenters = (await Promise.all(subscriptions.map(async (subscription) => (await this.getApiCenters(subscription)).map(apiCenter => ({ apiCenter: apiCenter, azureSubscription: subscription }))))).flat();
        const apiCentersApis = (await Promise.all(apiCenters.map(async (apiCenter) => (await this.getApiCenterApis(apiCenter.apiCenter, apiCenter.azureSubscription)).map(apiCenterApi => ({ apiCenterApi: apiCenterApi, apiCenter: apiCenter.apiCenter, azureSubscription: apiCenter.azureSubscription }))))).flat();
        const apiCenterApiVersions = (await Promise.all(apiCentersApis.map(async (apiCenterApi) => (await this.getApiCenterApiVersions(apiCenterApi.apiCenterApi, apiCenterApi.apiCenter, apiCenterApi.azureSubscription)).map(apiCenterApiVersion => ({ apiCenterApiVersion: apiCenterApiVersion, apiCenterApi: apiCenterApi.apiCenterApi, apiCenter: apiCenterApi.apiCenter, azureSubscription: apiCenterApi.azureSubscription }))))).flat();
        const apiCenterApiVersionDefinitions = (await Promise.all(apiCenterApiVersions.map(async (apiCenterApiVersion) => (await this.getApiCenterApiVersionDefinitions(apiCenterApiVersion.apiCenterApiVersion, apiCenterApiVersion.apiCenterApi, apiCenterApiVersion.apiCenter, apiCenterApiVersion.azureSubscription)).map(apiCenterApiVersionDefinition => ({ apiCenterApiVersionDefinition: apiCenterApiVersionDefinition, apiCenterApiVersion: apiCenterApiVersion.apiCenterApiVersion, apiCenterApi: apiCenterApiVersion.apiCenterApi, apiCenter: apiCenterApiVersion.apiCenter, azureSubscription: apiCenterApiVersion.azureSubscription }))))).flat();
        const specifications = (await Promise.all(apiCenterApiVersionDefinitions.map(async (apiCenterApiVersionDefinition) => (await this.exportSpecification(apiCenterApiVersionDefinition.apiCenterApiVersionDefinition, apiCenterApiVersionDefinition.apiCenterApiVersion, apiCenterApiVersionDefinition.apiCenterApi, apiCenterApiVersionDefinition.apiCenter, apiCenterApiVersionDefinition.azureSubscription)))));
        return specifications;
    }
    async getApiCenters(azureSubscription) {
        const query = "resources | where type =~ 'microsoft.apicenter/services'";
        const creds = (0, credentialUtil_1.getCredentialForToken)(await azureSubscription.session.credentials2.getToken([]));
        const client = new arm_resourcegraph_1.ResourceGraphClient(creds);
        const response = await client.resources({
            query: query,
            subscriptions: [
                azureSubscription.subscription.subscriptionId
            ]
        });
        return response.data;
    }
    async getApiCenterApis(apiCenter, azureSubscription) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await azureSubscription.session.credentials2.getToken([]));
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${azureSubscription.subscription.subscriptionId}/resourceGroups/${apiCenter.resourceGroup}/providers/Microsoft.ApiCenter/services/${apiCenter.name}/workspaces/default/apis?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody.value;
    }
    async getApiCenterApiVersions(apiCenterApi, apiCenter, azureSubscription) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await azureSubscription.session.credentials2.getToken([]));
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${azureSubscription.subscription.subscriptionId}/resourceGroups/${apiCenter.resourceGroup}/providers/Microsoft.ApiCenter/services/${apiCenter.name}/workspaces/default/apis/${apiCenterApi.name}/versions?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody.value;
    }
    async getApiCenterApiVersionDefinitions(apiCenterApiVersion, apiCenterApi, apiCenter, azureSubscription) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await azureSubscription.session.credentials2.getToken([]));
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${azureSubscription.subscription.subscriptionId}/resourceGroups/${apiCenter.resourceGroup}/providers/Microsoft.ApiCenter/services/${apiCenter.name}/workspaces/default/apis/${apiCenterApi.name}/versions/${apiCenterApiVersion.name}/definitions?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody.value;
    }
    async exportSpecification(apiCenterApiVersionDefinition, apiCenterApiVersion, apiCenterApi, apiCenter, azureSubscription) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await azureSubscription.session.credentials2.getToken([]));
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "POST",
            url: `https://management.azure.com/subscriptions/${azureSubscription.subscription.subscriptionId}/resourceGroups/${apiCenter.resourceGroup}/providers/Microsoft.ApiCenter/services/${apiCenter.name}/workspaces/default/apis/${apiCenterApi.name}/versions/${apiCenterApiVersion.name}/definitions/${apiCenterApiVersionDefinition.name}/exportSpecification?api-version=${this.apiVersion}`,
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
}
exports.AzureAccountApi = AzureAccountApi;
//# sourceMappingURL=azureAccountApi.js.map