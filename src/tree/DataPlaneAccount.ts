// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { ext } from "../extensionVariables";
export interface DataPlaneAccounts {
    readonly tenantId: string;
    readonly clientId: string;
    readonly accessToken: string;
}
export class DataPlanAccountManagerTreeItem extends AzExtParentTreeItem {
    public contextValue = DataPlanAccountManagerTreeItem.contextValue;
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const servers = this.serverName();
        return await this.createTreeItemsWithErrorHandling(
            servers,
            'inValidResource',
            async server => new ApiServerItem(this, server),
            server => server.name
        )
    }
    private serverName(): ApiServer[] {
        if (ext.dataPlaneAccounts.length == 0) {
            return [];
        }
        let results = [];
        for (let account of ext.dataPlaneAccounts) {
            let domain: string = account.domain;
            let res = domain.split('.')[0];
            results.push({ name: res } as ApiServer);
        }
        return results.flat();
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
    public static contextValue: string = "APICenter-Workspace-DataPlane-Account-Manager";
    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("versions");
    }

    public get label(): string {
        return "dataPlaneAccount";
    }
}

export class ApiServerItem extends AzExtParentTreeItem {
    public label: string;
    public contextValue: string;
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const apis = await this.getApis();
        return await this.createTreeItemsWithErrorHandling(
            apis,
            'invalidResource',
            async apic => new ApiTreeItem(this, apic),
            apic => apic.name
        );
    }
    public hasMoreChildrenImpl(): boolean {
        return false;
    }
    constructor(parent: AzExtParentTreeItem, apiCenterServer: ApiServer) {
        super(parent);
        this.label = apiCenterServer.name;
        this.contextValue = ApiServerItem.contextValue;
    }
    public static contextValue: string = "Workspace-APICenter-Server";
    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("versions");
    }
    private async getApis(): Promise<ApiCenter[]> {
        if (ext.dataPlaneAccounts.length == 0) {
            return [];
        }
        let result: ApiCenter[] = [];
        for (let data of ext.dataPlaneAccounts) {
            let server = new fetchApiCenterServer(data.domain, data.accessToken);
            let arrs = await server.getApis();
            result.push(arrs)
        }
        return result.flat();
    }
}

export class ApiTreeItem extends AzExtParentTreeItem {
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const versions = await this.getVersions();
        return await this.createTreeItemsWithErrorHandling(
            versions,
            'invalidResource',
            async version => new ApiVersionTreeItem(this, version),
            version => version.name
        );
    }
    public hasMoreChildrenImpl(): boolean {
        return false;
    }
    private async getVersions(): Promise<ApiVersion[]> {
        if (ext.dataPlaneAccounts.length == 0) {
            return [];
        }
        let result: ApiVersion[] = [];
        for (let data of ext.dataPlaneAccounts) {
            let server = new fetchApiCenterServer(data.domain, data.accessToken);
            let arrs = await server.getVersions(this.label);
            result.push(arrs)
        }
        return result.flat();
    }
    public label: string;
    public contextValue: string;
    constructor(parent: AzExtParentTreeItem, apiCenter: ApiCenter) {
        super(parent);
        this.label = apiCenter.name;
        this.contextValue = ApiTreeItem.contextValue;
    }
    public static contextValue: string = "Workspace-APICenter-API";
}

export class ApiVersionTreeItem extends AzExtParentTreeItem {
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const definitions = await this.getDefinitions();
        return await this.createTreeItemsWithErrorHandling(
            definitions,
            'invalidResource',
            async definition => new ApiDefinitionsTreeItem(this, definition),
            definition => definition.name
        );
    }
    private async getDefinitions(): Promise<ApiDefinitions[]> {
        if (ext.dataPlaneAccounts.length == 0) {
            return [];
        }
        let result: ApiDefinitions[] = [];
        for (let data of ext.dataPlaneAccounts) {
            let server = new fetchApiCenterServer(data.domain, data.accessToken);
            const label = this.parent?.label as string;
            let arrs = await server.getDefinitions(label, this.label);
            result.push(arrs)
        }
        return result.flat();
    }
    public hasMoreChildrenImpl(): boolean {
        return false;
    }
    public static contextValue: string = "Workspace-APICenter-Version";
    public label: string;
    public contextValue: string;
    constructor(parent: AzExtParentTreeItem, apiVersion: ApiVersion) {
        super(parent);
        this.label = apiVersion.name;
        this.contextValue = ApiVersionTreeItem.contextValue;
    }
}

export class ApiDefinitionsTreeItem extends AzExtTreeItem {
    public label: string;
    public contextValue: string;
    constructor(parent: AzExtParentTreeItem, definition: ApiDefinitions) {
        super(parent);
        this.label = definition.name;
        this.contextValue = ApiDefinitionsTreeItem.contextValue;
    }
    public static contextValue: string = "Workspace-APICenter-Definition";
}

export type ApiServer = {
    name: string;
}

export type ApiCenter = {
    name: string;
    title: string;
    kind: string;
    lifecycleStage: string;
    externalDocumentation: [];
    contacts: [];
    customProperties: {};
};

export type ApiVersion = {
    name: string;
    title: string;
    lifecycleStage: string;
}

export type ApiDefinitions = {
    name: string;
    title: string;
    specification: {
        name: string;
    }
}

export class fetchApiCenterServer {
    constructor(private domain: string, private accessToken: string) {
    }
    private async requestApis(queryString: string) {
        const requestUrl = `https://${this.domain}/workspaces/default/${queryString}`;

        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.accessToken,
        };

        const response = await fetch(requestUrl, { headers });

        if (response.status === 401 || response.status == 403) {
            return;
        } else if (!response.ok) {
            return;
        }

        const dataJson = await response.json();
        return dataJson.value;
    }
    public async getApis(queryString?: string): Promise<any> {
        return queryString ? await this.requestApis(`apis?${queryString}`) : await this.requestApis(`apis`);
    }

    public async getApi(id: string) {
        return await this.requestApis(`apis/${id}`);
    }

    public async getVersions(apiId: string) {
        return await this.requestApis(`apis/${apiId}/versions`);
    }

    public async getDeployments(apiId: string) {
        return await this.requestApis(`apis/${apiId}/deployments`);
    }

    public async getDefinitions(apiId: string, version: string) {
        return await this.requestApis(`apis/${apiId}/versions/${version}/definitions`);
    }
}
