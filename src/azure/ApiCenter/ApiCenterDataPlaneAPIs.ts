// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
export interface DataPlaneAccount {
    readonly domain: string;
    readonly tenantId: string;
    readonly clientId: string;
}
enum Method {
    GET = "GET",
    POST = "POST",
}
export class ApiCenterDataPlaneService {
    private account: DataPlaneAccount;
    constructor(domain: string, clientId: string, tenantId: string) {
        this.account = {
            domain: domain,
            clientId: clientId,
            tenantId: tenantId
        }
    };
    private async getDataPlaneToken(): Promise<string> {
        const session = await vscode.authentication.getSession('microsoft', [
            `VSCODE_CLIENT_ID:${this.account.clientId}`, // Replace by your client id
            `VSCODE_TENANT:${this.account.tenantId}`, // Replace with the tenant ID or common if multi-tenant
            "offline_access", // Required for the refresh token.
            "https://azure-apicenter.net/user_impersonation"
        ], { createIfNone: true });
        if (session?.accessToken) {
            return session.accessToken;
        } else {
            throw new Error('sign in failed');
        }
    };
    private async exitFromSession() {
        const session = await vscode.authentication.getSession('microsoft', [
            `VSCODE_CLIENT_ID:${this.account.clientId}`, // Replace by your client id
            `VSCODE_TENANT:${this.account.tenantId}`, // Replace with the tenant ID or common if multi-tenant
            "offline_access", // Required for the refresh token.
            "https://azure-apicenter.net/user_impersonation"
        ], { clearSessionPreference: true });
        if (session?.accessToken) {
            return session.accessToken;
        } else {
            vscode.window.showErrorMessage("Please login your Microsoft Account first!");
        }
    };
    private async requestApis(queryString: string, method: Method = Method.GET) {
        const requestUrl = `https://${this.account.domain}/workspaces/default/${queryString}`;
        const accessToken = await this.getDataPlaneToken();
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
        };

        const response = await fetch(requestUrl, { method: method, headers: headers });

        if (response.status === 401 || response.status == 403) {
            return;
        } else if (!response.ok) {
            return;
        }

        const dataJson = await response.json();
        return dataJson;
    };
    public async getApis(queryString?: string): Promise<{ value: ApiCenter[]; nextLink: string }> {
        return queryString ? await this.requestApis(`apis?${queryString}`) : await this.requestApis(`apis`);
    }

    public async getApi(id: string): Promise<{ value: ApiCenter[]; nextLink: string }> {
        return await this.requestApis(`apis/${id}`);
    }

    public async getVersions(apiId: string): Promise<{ value: ApiVersion[]; nextLink: string }> {
        return await this.requestApis(`apis/${apiId}/versions`);
    }

    public async getDeployments(apiId: string) {
        return await this.requestApis(`apis/${apiId}/deployments`);
    }

    public async getDefinitions(apiId: string, version: string): Promise<{ value: ApiDefinitions[]; nextLink: string }> {
        return await this.requestApis(`apis/${apiId}/versions/${version}/definitions`);
    }

    public async exportDefinitionLink(apiName: string, apiVersion: string, definitionName: string) {
        return await this.requestApis(
            `apis/${apiName}/versions/${apiVersion}/definitions/${definitionName}:exportSpecification`,
            Method.POST
        );
    }
}
