// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext, TreeItemIconPath } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { getSessionToken } from "../commands/workspaceApis";
import { DataPlaneAccount, ext } from "../extensionVariables";
import { UiStrings } from "../uiStrings";
import { treeUtils } from "../utils/treeUtils";

export class DataPlanAccountManagerTreeItem extends AzExtParentTreeItem {
    public contextValue = DataPlanAccountManagerTreeItem.contextValue;
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const accounts = ext.dataPlaneAccounts;
        return await this.createTreeItemsWithErrorHandling(
            accounts,
            'inValidResource',
            async account => new ApiServerItem(this, account),
            account => account.domain.split('0')[0]
        )
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
    public readonly apisTreeItem: ApiTreesItem;
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        return [this.apisTreeItem]
    }
    public hasMoreChildrenImpl(): boolean {
        return false;
    }
    constructor(parent: AzExtParentTreeItem, account: DataPlaneAccount) {
        super(parent);
        this.label = account.domain.split('.')[0];
        this.contextValue = ApiServerItem.contextValue;
        this.apisTreeItem = new ApiTreesItem(this, account);
    }
    public get id(): string {
        return this.label;
    }
    public static contextValue: string = "WorkspaceAPICenter-Server";
    public get iconPath(): TreeItemIconPath {
        return treeUtils.getIconPath('apiCenter');
    }
}

export class ApiTreesItem extends AzExtParentTreeItem {
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const apis = await this.getApis();
        return await this.createTreeItemsWithErrorHandling(
            apis,
            'invalidResource',
            async apic => new ApiTreeItem(this, this.account, this.label, apic),
            apic => apic.name
        );
    }
    public hasMoreChildrenImpl(): boolean {
        return false
    }
    public static contextValue: string = "workspaceApiCenterApis";
    public contextValue: string = ApiTreesItem.contextValue;
    private _nextLink: string | undefined;
    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("library");
    }
    public get label(): string {
        return UiStrings.TreeitemLabelApis;
    }
    constructor(parent: AzExtParentTreeItem, public account: DataPlaneAccount) {
        super(parent);
    }
    private async getApis(): Promise<ApiCenter[]> {
        let accessToken = await getSessionToken(this.account.clientId, this.account.tenantId);
        let result = [];
        if (accessToken) {
            let server = new fetchApiCenterServer(this.account.domain, accessToken);
            let arrs = await server.getApis();
            if (arrs) result.push(arrs)
        }
        return result.flat();
    }
}

export class ApiTreeItem extends AzExtParentTreeItem {
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        return [this.apiVersionsTreeItem]
    }
    public hasMoreChildrenImpl(): boolean {
        return false;
    }
    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("library");
    }
    public label: string;
    public contextValue: string;
    private readonly _apiCenterName: string;
    public readonly apiVersionsTreeItem: ApiVersionsTreeItem;
    constructor(parent: AzExtParentTreeItem, account: DataPlaneAccount, apiName: string, apiCenter: ApiCenter) {
        super(parent);
        this.label = apiCenter.name;
        this._apiCenterName = apiName;
        this.contextValue = ApiTreeItem.contextValue;
        this.apiVersionsTreeItem = new ApiVersionsTreeItem(this, account, apiName, apiCenter);
    }
    public static contextValue: string = "WorkspaceAPICenter-API";
}

export class ApiVersionsTreeItem extends AzExtParentTreeItem {
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const versions = await this.getVersions();
        return await this.createTreeItemsWithErrorHandling(
            versions,
            'invalidResource',
            async version => new ApiVersionTreeItem(this, this.account, this._apiCenterName, this._apiCenterApi.name, version),
            version => version.name
        );
    }
    public hasMoreChildrenImpl(): boolean {
        return false;
    }
    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("versions");
    }
    public static contextValue: string = "workspaceApiCenterApiVersions";
    public readonly contextValue: string = ApiVersionsTreeItem.contextValue;
    public get label(): string {
        return UiStrings.TreeitemLabelVersions;
    }
    private readonly _apiCenterName: string;
    private readonly _apiCenterApi: ApiCenter;
    constructor(parent: AzExtParentTreeItem, public account: DataPlaneAccount, apiCenterName: string, apiCenterApi: ApiCenter) {
        super(parent);
        this._apiCenterName = apiCenterName;
        this._apiCenterApi = apiCenterApi;
    }
    private async getVersions(): Promise<ApiVersion[]> {
        let accessToken = await getSessionToken(this.account.clientId, this.account.tenantId);
        let result = [];
        if (accessToken) {
            let server = new fetchApiCenterServer(this.account.domain, accessToken);
            let arrs = await server.getVersions(this._apiCenterApi.name);
            if (arrs) result.push(arrs)
        }
        return result.flat();
    }
}
export class ApiVersionTreeItem extends AzExtParentTreeItem {
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        return [this.apiVersionDefinitionsTreeItem];
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
    public static contextValue: string = "WorkspaceAPICenter-Version";
    public label: string;
    public contextValue: string;
    public readonly apiVersionDefinitionsTreeItem: ApiDefinitionsTreeItem;
    constructor(parent: AzExtParentTreeItem, account: DataPlaneAccount, apiServerName: string, apiName: string, apiVersion: ApiVersion) {
        super(parent);
        this.apiVersionDefinitionsTreeItem = new ApiDefinitionsTreeItem(this, account, apiServerName, apiName, apiVersion);
        this.label = apiVersion.name;
        this.contextValue = ApiVersionTreeItem.contextValue;
    }
    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("versions");
    }
}
export class ApiDefinitionsTreeItem extends AzExtParentTreeItem {
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const definitions = await this.getDefinitions();
        return await this.createTreeItemsWithErrorHandling(
            definitions,
            'invalidResource',
            async definition => new ApiDefinitionTreeItem(this, this.account, this._apiCenterName, this._apiCenterApiName, this._apiCenterApiVersion.name, definition),
            definition => definition.name
        );
    }
    public static contextValue: string = "workspaceApiCenterApiVersionDefinitions";
    public readonly contextValue: string = ApiDefinitionsTreeItem.contextValue;
    private readonly _apiCenterName: string;
    private readonly _apiCenterApiName: string;
    private readonly _apiCenterApiVersion: ApiVersion;
    public hasMoreChildrenImpl(): boolean {
        return false;
    }
    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("list-selection");
    }
    constructor(parent: AzExtParentTreeItem, public account: DataPlaneAccount, apiService: string, apiName: string, apiVersion: ApiVersion) {
        super(parent);
        this._apiCenterName = apiService;
        this._apiCenterApiName = apiName;
        this._apiCenterApiVersion = apiVersion;
    }

    public get label(): string {
        return UiStrings.TreeitemLabelDefinitions;
    }
    private async getDefinitions(): Promise<ApiDefinitions[]> {
        let accessToken = await getSessionToken(this.account.clientId, this.account.tenantId);
        let result = [];
        if (accessToken) {
            let server = new fetchApiCenterServer(this.account.domain, accessToken);
            let arrs = await server.getDefinitions(this._apiCenterApiName, this._apiCenterApiVersion.name);
            if (arrs) {
                result.push(arrs)
            }
        }
        return result.flat();
    }
}
export class ApiDefinitionTreeItem extends AzExtTreeItem {
    public readonly label: string;
    public contextValue: string;
    public readonly apiCenterName: string;
    public readonly apiName: string;
    public readonly apiVersion: string;
    constructor(parent: AzExtParentTreeItem, public account: DataPlaneAccount, apiCenterName: string, apiName: string, apiVersion: string, definition: ApiDefinitions) {
        super(parent);
        this.label = definition.name;
        this.apiCenterName = apiCenterName;
        this.apiName = apiName;
        this.apiVersion = apiVersion;
        this.contextValue = ApiDefinitionTreeItem.contextValue;
    }
    public static contextValue: string = "WorkspaceAPICenter-Definition";
    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("list-selection");
    }
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

export enum Method {
    GET = "GET",
    POST = "POST",
}

export class fetchApiCenterServer {
    constructor(private domain: string, private accessToken: string) {
    }
    private async requestApis(queryString: string, method: Method = Method.GET) {
        const requestUrl = `https://${this.domain}/workspaces/default/${queryString}`;

        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.accessToken,
        };

        const response = await fetch(requestUrl, { method: method, headers: headers });

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

    public async exportDefinitionLink(apiName: string, apiVersion: string, definitionName: string) {
        return await this.requestApis(
            `apis/${apiName}/versions/${apiVersion}/definitions/${definitionName}:exportSpecification`,
            Method.POST
        );
    }
}
