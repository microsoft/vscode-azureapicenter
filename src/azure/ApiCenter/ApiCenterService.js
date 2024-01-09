"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCenterService = void 0;
const ms_rest_js_1 = require("@azure/ms-rest-js");
const credentialUtil_1 = require("../../utils/credentialUtil");
class ApiCenterService {
    constructor(susbcriptionContext, resourceGroupName, apiCenterName) {
        this.apiVersion = "2023-07-01-preview";
        this.susbcriptionContext = susbcriptionContext;
        this.apiCenterName = apiCenterName;
        this.resourceGroupName = resourceGroupName;
    }
    async getApiCenter() {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    async getApiCenterApis() {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    async getApiCenterEnvironments() {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/environments?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    async getApiCenterApiVersions(apiName) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    async getApiCenterApiDeployments(apiName) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/deployments?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    async getApiCenterApiVersionDefinitions(apiName, apiVersion) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "GET",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions/${apiVersion}/definitions?api-version=${this.apiVersion}`
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    async createOrUpdateApi(apiCenterApi) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "PUT",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiCenterApi.name}?api-version=${this.apiVersion}`,
            body: apiCenterApi.properties
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    async createOrUpdateApiVersion(apiName, apiCenterApiVersion) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "PUT",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions/${apiCenterApiVersion.name}?api-version=${this.apiVersion}`,
            body: apiCenterApiVersion.properties
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    async createOrUpdateApiDeployment(apiName, apiCenterApiDeployment) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "PUT",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/deployments/${apiCenterApiDeployment.name}?api-version=${this.apiVersion}`,
            body: apiCenterApiDeployment.properties
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    async createOrUpdateApiVersionDefinition(apiName, apiVersionName, apiCenterApiVersionDefinition) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "PUT",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions/${apiVersionName}/definitions/${apiCenterApiVersionDefinition.name}?api-version=${this.apiVersion}`,
            body: apiCenterApiVersionDefinition.properties
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    async importSpecification(apiName, apiVersionName, apiCenterApiVersionDefinitionName, importPayload) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        let options = {
            method: "POST",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions/${apiVersionName}/definitions/${apiCenterApiVersionDefinitionName}/importSpecification?api-version=${this.apiVersion}`,
            body: importPayload
        };
        let response = await client.sendRequest(options);
        const location = response.headers.get("Location");
        if (!location) {
            return false;
        }
        options = {
            method: "GET",
            url: location,
        };
        return await this.sendRequestWithTimeout(client, options, 120000); // 2 minutes in milliseconds
    }
    async exportSpecification(apiName, apiVersionName, apiCenterApiVersionDefinitionName) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new ms_rest_js_1.ServiceClient(creds);
        const options = {
            method: "POST",
            url: `https://management.azure.com/subscriptions/${this.susbcriptionContext.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ApiCenter/services/${this.apiCenterName}/workspaces/default/apis/${apiName}/versions/${apiVersionName}/definitions/${apiCenterApiVersionDefinitionName}/exportSpecification?api-version=${this.apiVersion}`,
        };
        const response = await client.sendRequest(options);
        return response.parsedBody;
    }
    async sendRequestWithTimeout(client, options, timeout) {
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
exports.ApiCenterService = ApiCenterService;
//# sourceMappingURL=ApiCenterService.js.map