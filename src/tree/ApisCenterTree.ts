// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { treeUtils } from "../utils/treeUtils";

export class ApisNodeClientProvider implements vscode.TreeDataProvider<ApisVersions> {
    private apiServer: fetchApiCenterServer;
    constructor(private domain: string, private ssoToken: string) {
        this.apiServer = new fetchApiCenterServer(domain, ssoToken);
    }
    private _onDidChangeTreeData: vscode.EventEmitter<ApisVersions | undefined | void> = new vscode.EventEmitter<ApisVersions | undefined | void>();
    onDidChangeTreeData?: vscode.Event<void | ApisVersions | ApisVersions[] | null | undefined> | undefined = this._onDidChangeTreeData.event;
    getTreeItem(element: ApisVersions): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: ApisVersions | undefined): vscode.ProviderResult<ApisVersions[]> {
        if (!this.ssoToken) {
            vscode.window.showInformationMessage('Please sign in first');
            return Promise.resolve([]);
        }
        // const jsonData = await this.apiServer.getApis();
        if (element) {
            switch (element.type) {
                case APIType.API: return Promise.resolve(this.generateVersions(element.name));
                case APIType.Version: return Promise.resolve(this.generateDefinitions(element.rootName, element.name))
            }
        } else {
            return Promise.resolve(this.generateApis());
        }
    }
    private async generateDefinitions(name: string, version: string): Promise<ApisVersions[]> {
        let dataJson: [] = await this.apiServer.getDefinitions(name, version);
        let res: ApisVersions[] = [];
        for (let item of dataJson) {
            res.push(new ApisVersions(APIType.Definition, name, item.name, item.title, "", "", item.specification, vscode.TreeItemCollapsibleState.Collapsed))
        }
        return res;
    }
    private async generateVersions(name: string): Promise<ApisVersions[]> {
        let dataJson: [] = await this.apiServer.getVersions(name);
        let res: ApisVersions[] = [];
        for (let item of dataJson) {
            res.push(new ApisVersions(APIType.Version, name, item.name, item.title, "", item.lifeCycle, "", vscode.TreeItemCollapsibleState.Collapsed))
        }
        return res;
    }
    private async generateApis(): Promise<ApisVersions[]> {
        let dataJson: [] = await this.apiServer.getApis();
        let res: ApisVersions[] = []
        for (let item of dataJson) {
            res.push(new ApisVersions(APIType.API, item?.name, item?.name, item?.title, item?.kind, item?.lifecycleStage, "", vscode.TreeItemCollapsibleState.Collapsed))
        }
        return res;
    }
    getParent?(element: ApisVersions): vscode.ProviderResult<ApisVersions> {
        throw new Error('Method not implemented.');
    }
    resolveTreeItem?(item: vscode.TreeItem, element: ApisVersions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error('Method not implemented.');
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

export class ApisNodeProvider implements vscode.TreeDataProvider<ApisVersions> {
    private _onDidChangeTreeData: vscode.EventEmitter<ApisVersions | undefined | void> = new vscode.EventEmitter<ApisVersions | undefined | void>();
    onDidChangeTreeData?: vscode.Event<void | ApisVersions | ApisVersions[] | null | undefined> | undefined = this._onDidChangeTreeData.event;
    getTreeItem(element: ApisVersions): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: ApisVersions | undefined): vscode.ProviderResult<ApisVersions[]> {
        if (!this.jsonData) {
            vscode.window.showInformationMessage('No Data in empty workspace');
            return Promise.resolve([]);
        }
        if (element) {
            // versions

        } else {
            return Promise.resolve(this.generateApis(this.jsonData));
        }
    }
    getParent?(element: ApisVersions): vscode.ProviderResult<ApisVersions> {
        throw new Error('Method not implemented.');
    }
    resolveTreeItem?(item: vscode.TreeItem, element: ApisVersions, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error('Method not implemented.');
    }
    constructor(private jsonData: [] | undefined) {
    }
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
    private async generateApis(dataJson: []): Promise<ApisVersions[]> {
        let res: ApisVersions[] = [];
        for (let item of dataJson) {
            res.push(new ApisVersions(APIType.API, item?.name, item?.name, item?.title, item?.kind, item?.lifecycleStage, "", vscode.TreeItemCollapsibleState.Collapsed))
        }
        return res;
    }
}

export enum APIType {
    API = "Api",
    Version = "Version",
    Definition = "Definition"
}

export class ApisVersions extends vscode.TreeItem {
    constructor(
        public readonly type: APIType,
        public readonly rootName: string,
        public readonly name: string,
        public readonly title: string,
        public readonly kind: string,
        public readonly lifecycle: string,
        public readonly specification: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(title, collapsibleState);
        this.rootName = rootName;
        this.name = name;
        this.kind = kind;
        this.type = type;
        this.lifecycle = lifecycle;
        this.specification = specification;
    }
    iconPath = this.type == APIType.API ? treeUtils.getIconPath('apiCenter') : this.type == APIType.Version ? new vscode.ThemeIcon("versions") : new vscode.ThemeIcon("list-selection");
    contextValue = `workspace-apicenter-server`;
}

export class ApisVersion extends vscode.TreeItem {
    constructor(
        public readonly name: string,
        public readonly title: string,
        public readonly lifeCycle: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(title, collapsibleState);
        this.name = name;
        this.title = title;
        this.lifeCycle = lifeCycle
    }
    contextValue = `workspace-apicenter-version`;
    iconPath = new vscode.ThemeIcon("versions");
}

export type ApiCenterDataApi = {
    name: string;
    title: string;
    kind: string;
    lifecycleStage: string;
}

export enum Method {
    GET = "GET",
    POST = "POST",
}
export interface IHttpClient {
    fetchData(url: string, method: Method): Promise<any>;
}

/**
export class HttpClient implements IHttpClient {
    public async fetchData(accessToken: string, domain: string, method: Method = Method.GET): Promise<any> {
        const requestUrl = `https://${domain}/`;

        const headers: HeadersInit = {
            Accept: "application/json",
            "Content-Type": "application/json",
        };

        if (accessToken) {
            headers.Authorization = "Bearer " + accessToken;
        }

        const response = await fetch(requestUrl, { method, headers });

        if (accessToken && (response.status === 401 || response.status == 403)) {
            return;
        } else if (!response.ok) {
            return;
        }

        const dataJson = await response.json();
        return dataJson;
    }
}

export class ApiService {
    constructor(private httpClient: any) { }

    public async getApis(queryString?: string): Promise<any> {
        return queryString ? await this.httpClient(`apis?${queryString}`) : await this.httpClient(`apis`);
    }

    public async getApi(id: string) {
        return await this.httpClient(`apis/${id}`);
    }

    public async getVersions(apiId: string) {
        return await this.httpClient(`apis/${apiId}/versions`);
    }

    public async getDeployments(apiId: string) {
        return await this.httpClient(`apis/${apiId}/deployments`);
    }

    public async getDefinitions(apiId: string, version: string) {
        return await this.httpClient(`apis/${apiId}/versions/${version}/definitions`);
    }

    public async getSpecificationLink(apiName: string, versionName: string, definitionName: string) {
        const response = await this.httpClient(
            `apis/${apiName}/versions/${versionName}/definitions/${definitionName}:exportSpecification`,
            Method.POST
        );
        return response.value;
    }
}

// export class ApisTreeProvider implements AzExtParentTreeItem {
//     public static contextValue: string = "azureApiCenterDataPlaneApi";
//     private readonly _apiCenterName: string;
//     private readonly _apiCenterApi: ApiCenterDataApi;
//     public readonly apiVersionsTreeItem: ApiVersionsTreeItem;
//     public readonly apiDeploymentsTreeItem: ApiDeploymentsTreeItem;
//     constructor(apiCenterName: string, apiCenterApi: ApiCenterDataApi) {
//         this._apiCenterName = apiCenterName;
//         this._apiCenterApi = apiCenterApi;
//         this.apiVersionsTreeItem = new ApiVersionsTreeItem(this, apiCenterName, apiCenterApi);
//         this.apiDeploymentsTreeItem = new ApiDeploymentsTreeItem(this, apiCenterName, apiCenterApi);
//     }
//     public hasMoreChildrenImpl(): boolean {
//         return this._nextLink !== undefined;
//     }

//     public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
//         return [this.apiVersionsTreeItem, this.apiDeploymentsTreeItem];
//     }
// }

export function ParseJsonToApi(jsonData: []): ApiCenterApi[] {
    let res: ApiCenterApi[] = [];
    for (let data of jsonData) {
        let api: ApiCenterApi = {
            id: data["name"],
            location: "",
            name: data["name"],
            properties: {
                title: data["title"],
                kind: data["kind"],
            },
            // tslint:disable-next-line:no-reserved-keywords
            type: ""
        };
        res.push(api);
    }
    return res;
}
*/
