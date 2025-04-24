// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, GenericTreeItem, IActionContext, ISubscriptionContext, TreeItemIconPath, registerEvent } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { DataPlaneAccount } from "../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { ApiCenterApisDataplane } from "../azure/ApiCenterDefines/ApiCenterApi";
import { AzureDataSessionProvider } from "../azure/azureLogin/authTypes";
import { AzureAuth } from "../azure/azureLogin/azureAuth";
import { AzureDataSessionProviderHelper, generateScopes } from "../azure/azureLogin/dataSessionProvider";
import { TelemetryClient } from "../common/telemetryClient";
import { TelemetryEvent } from "../common/telemetryEvent";
import { ext } from "../extensionVariables";
import { UiStrings } from "../uiStrings";
import { GeneralUtils } from "../utils/generalUtils";
import { TelemetryUtils } from "../utils/telemetryUtils";
import { treeUtils } from "../utils/treeUtils";
import { ApisTreeItem } from "./ApisTreeItem";
export function createAzureDataAccountTreeItem(
    sessionProvider: AzureDataSessionProvider,
): AzExtParentTreeItem & { dispose(): unknown } {
    return new DataPlanAccountManagerTreeItem(sessionProvider);
}
export class DataPlanAccountManagerTreeItem extends AzExtParentTreeItem {
    public contextValue: string = DataPlanAccountManagerTreeItem.contextValue;
    constructor(private readonly sessionProvider: AzureDataSessionProvider) {
        super(undefined);
        this.autoSelectInTreeItemPicker = true;

        const onStatusChange = this.sessionProvider.signInStatusChangeEvent;
        registerEvent("DataPlanAccountManagerTreeItem.onSignInStatusChange", onStatusChange, (context) => {
            this.refresh(context);
        });
    }
    public dispose(): void { }
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[] | GenericTreeItem[]> {
        const accounts = ext.dataPlaneAccounts;
        if (!accounts.length) {
            return [new GenericTreeItem(this, {
                label: UiStrings.APIDataPlaneWiki,
                commandId: "azure-api-center.apiCenterWorkspace.learnApiCatalog",
                contextValue: "azureCommand",
                id: "azureapicentercatalogwiki",
                iconPath: new vscode.ThemeIcon("book"),
                includeInTreeItemPicker: true,
            })];
        }
        return await this.createTreeItemsWithErrorHandling(
            accounts,
            'inValidResource',
            async account => new ApiServerItem(this, getSubscriptionContext(account)),
            account => account.domain.split('0')[0]
        );
    }

    public hasMoreChildrenImpl(): boolean {
        return false;
    }
    public static contextValue: string = "azureApiCenterDataPlaneView";
    public get iconPath(): TreeItemIconPath {
        return new vscode.ThemeIcon("versions");
    }

    public get label(): string {
        return "dataPlaneAccount";
    }

}

export class ApiServerItem extends AzExtParentTreeItem {
    public label: string;
    public readonly subscriptionContext: ISubscriptionContext;
    public readonly apisTreeItem: ApisTreeItem;
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        let scopes = generateScopes(this.subscriptionContext.userId, this.subscriptionContext!.tenantId!);
        const properties: { [key: string]: string; } = {};
        TelemetryUtils.setAzureResourcesInfo(properties, this);
        TelemetryClient.sendEvent(TelemetryEvent.treeviewListDataPlane, properties);
        const authSession = await AzureDataSessionProviderHelper.getSessionProvider().getAuthSession(scopes);
        if (GeneralUtils.failed(authSession)) {
            return [
                new GenericTreeItem(this, {
                    label: UiStrings.SignIntoAzure,
                    commandId: "azure-api-center.apiCenterWorkspace.signInToDataPlane",
                    contextValue: "azureCommand",
                    id: "azureapicenterAccountSignIn",
                    iconPath: new vscode.ThemeIcon("sign-in"),
                    includeInTreeItemPicker: true,
                })
            ];
        }
        return [this.apisTreeItem];
    }
    public hasMoreChildrenImpl(): boolean {
        return false;
    }
    get subscription(): ISubscriptionContext {
        return this.subscriptionContext;
    }
    constructor(parent: AzExtParentTreeItem, subContext: ISubscriptionContext) {
        super(parent);
        this.label = subContext.subscriptionPath.split('.')[0];
        this.subscriptionContext = subContext;
        this.apisTreeItem = new ApisTreeItem(this, new ApiCenterApisDataplane({ name: this.label }));
    }
    public get id(): string {
        return this.label;
    }
    public contextValue: string = ApiServerItem.contextValue;
    public static contextValue: string = "azureApiCenterDataPlane";
    public get iconPath(): TreeItemIconPath {
        return treeUtils.getIconPath('apiCenter');
    }
}

export function getSubscriptionContext(
    account: DataPlaneAccount
): ISubscriptionContext {
    const credentials = AzureAuth.getDataPlaneCredential(account.clientId, account.tenantId);
    const environment = AzureAuth.getEnvironment();

    return {
        credentials,
        subscriptionDisplayName: "",
        subscriptionId: "",
        subscriptionPath: account.domain,
        tenantId: account.tenantId,
        userId: account.clientId,
        environment,
        isCustomCloud: environment.name === "AzureCustomCloud",
    };
}
