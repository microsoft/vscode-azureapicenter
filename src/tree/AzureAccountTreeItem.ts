// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Subscription } from "@azure/arm-resources-subscriptions";
import {
  AzExtParentTreeItem,
  AzExtTreeItem,
  GenericTreeItem,
  ISubscriptionContext,
  registerEvent,
  TreeItemIconPath
} from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { AzureSessionProvider, ReadyAzureSessionProvider, SelectionType, SignInStatus } from "../azure/azureLogin/authTypes";
import { AzureAuth } from "../azure/azureLogin/azureAuth";
import { AzureSubscriptionHelper } from "../azure/azureLogin/subscriptions";
import { AzureAccountType } from "../constants";
import { UiStrings } from "../uiStrings";
import { treeUtils } from "../utils/treeUtils";
import { Utils } from "../utils/utils";
import { createSubscriptionTreeItem } from "./SubscriptionTreeItem";

export function createAzureAccountTreeItem(
  sessionProvider: AzureSessionProvider,
): AzExtParentTreeItem & { dispose(): unknown } {
  return new AzureAccountTreeItem(sessionProvider);
}

export class AzureAccountTreeItem extends AzExtParentTreeItem {
  private subscriptionTreeItems: AzExtTreeItem[] | undefined;
  public static contextValue: string = "azureApiCenterAzureAccount";
  public readonly contextValue: string = AzureAccountTreeItem.contextValue;
  constructor(private readonly sessionProvider: AzureSessionProvider) {
    super(undefined);
    this.autoSelectInTreeItemPicker = true;

    const onStatusChange = this.sessionProvider.signInStatusChangeEvent;
    const onFilteredSubscriptionsChange = AzureSubscriptionHelper.getFilteredSubscriptionsChangeEvent();
    registerEvent("azureAccountTreeItem.onSignInStatusChange", onStatusChange, (context) => this.refresh(context));
    registerEvent("azureAccountTreeItem.onSubscriptionFilterChange", onFilteredSubscriptionsChange, (context) =>
      this.refresh(context),
    );
  }

  public override get label() {
    return UiStrings.AzureAccount;
  }

  public override get iconPath(): TreeItemIconPath {
    return treeUtils.getIconPath('azureAccount');
  }

  public dispose(): void { }

  public hasMoreChildrenImpl(): boolean {
    return false;
  }

  public compareChildrenImpl(item1: AzExtTreeItem, item2: AzExtTreeItem): number {
    return item1.id!.localeCompare(item2.id!);
  }

  public async loadMoreChildrenImpl(): Promise<AzExtTreeItem[]> {
    const existingSubscriptionTreeItems: AzExtTreeItem[] = this.subscriptionTreeItems || [];
    this.subscriptionTreeItems = [];

    switch (this.sessionProvider.signInStatus) {
      case SignInStatus.Initializing:
        return [
          new GenericTreeItem(this, {
            label: UiStrings.Loading,
            contextValue: "azureCommand",
            id: "azureapicenterAccountLoading",
            iconPath: new vscode.ThemeIcon("loading~spin"),
          }),
        ];
      case SignInStatus.SignedOut:
        return [
          new GenericTreeItem(this, {
            label: UiStrings.SignIntoAzure,
            commandId: "azure-api-center.signInToAzure",
            contextValue: "azureCommand",
            id: "azureapicenterAccountSignIn",
            iconPath: new vscode.ThemeIcon("sign-in"),
            includeInTreeItemPicker: true,
          }),
          new GenericTreeItem(this, {
            label: UiStrings.CreateAzureAccount,
            commandId: "azure-api-center.openUrl",
            contextValue: "azureCommand",
            id: AzureAccountType.createAzureAccount,
            iconPath: new vscode.ThemeIcon("add"),
            includeInTreeItemPicker: true,
          }),
          new GenericTreeItem(this, {
            label: UiStrings.CreateAzureStudentAccount,
            commandId: "azure-api-center.openUrl",
            contextValue: "azureCommand",
            id: AzureAccountType.createAzureStudentAccount,
            iconPath: new vscode.ThemeIcon("mortar-board"),
            includeInTreeItemPicker: true,
          })
        ];
      case SignInStatus.SigningIn:
        return [
          new GenericTreeItem(this, {
            label: UiStrings.WaitForSignIn,
            contextValue: "azureCommand",
            id: "azureapicenterAccountSigningIn",
            iconPath: new vscode.ThemeIcon("loading~spin"),
          }),
        ];
    }

    if (this.sessionProvider.selectedTenant === null && this.sessionProvider.availableTenants.length > 1) {
      // Signed in, but no tenant selected, AND there is more than one tenant to choose from.
      return [
        new GenericTreeItem(this, {
          label: UiStrings.SelectTenant,
          commandId: "azure-api-center.selectTenant",
          contextValue: "azureCommand",
          id: "azureapicenterAccountSelectTenant",
          iconPath: new vscode.ThemeIcon("account"),
          includeInTreeItemPicker: true,
        }),
      ];
    }

    // Either we have a selected tenant, or there is only one available tenant and it's not selected
    // because it requires extra interaction. Calling `getAuthSession` will complete that process.
    // We will need the returned auth session in any case for creating a subscription context.
    const session = await this.sessionProvider.getAuthSession();
    if (Utils.failed(session) || !AzureAuth.isReady(this.sessionProvider)) {
      return [
        new GenericTreeItem(this, {
          label: UiStrings.ErrorAuthenticating,
          contextValue: "azureCommand",
          id: "AzureAccountError",
          iconPath: new vscode.ThemeIcon("error"),
        }),
      ];
    }

    const subscriptions = await AzureSubscriptionHelper.getSubscriptions(this.sessionProvider, SelectionType.AllIfNoFilters);
    if (Utils.failed(subscriptions)) {
      return [
        new GenericTreeItem(this, {
          label: UiStrings.ErrorLoadingSubscriptions,
          contextValue: "azureCommand",
          id: "AzureAccountError",
          iconPath: new vscode.ThemeIcon("error"),
          description: subscriptions.error,
        }),
      ];
    }

    if (subscriptions.result.length === 0) {
      return [
        new GenericTreeItem(this, {
          label: UiStrings.NoSubscriptionsFound,
          contextValue: "azureCommand",
          id: "AzureAccountError",
          iconPath: new vscode.ThemeIcon("info"),
        }),
      ];
    }

    // We've confirmed above that the provider is ready.
    const readySessionProvider: ReadyAzureSessionProvider = this.sessionProvider;

    this.subscriptionTreeItems = await Promise.all(
      subscriptions.result.map(async (subscription: any) => {
        const existingTreeItem: AzExtTreeItem | undefined = existingSubscriptionTreeItems.find(
          (ti) => ti.id === subscription.subscriptionId,
        );
        if (existingTreeItem) {
          return existingTreeItem;
        } else {
          const subscriptionContext = getSubscriptionContext(
            readySessionProvider,
            session.result,
            subscription,
          );
          return await createSubscriptionTreeItem(this, subscriptionContext);
        }
      }),
    );

    return this.subscriptionTreeItems!;
  }
}

function getSubscriptionContext(
  sessionProvider: ReadyAzureSessionProvider,
  session: vscode.AuthenticationSession,
  subscription: Subscription,
): ISubscriptionContext {
  const credentials = AzureAuth.getCredential(sessionProvider);
  const environment = AzureAuth.getEnvironment();

  return {
    credentials,
    subscriptionDisplayName: subscription.displayName || "",
    subscriptionId: subscription.subscriptionId || "",
    subscriptionPath: `/subscriptions/${subscription.subscriptionId}`,
    tenantId: subscription.tenantId || "",
    userId: session.account.id,
    environment,
    isCustomCloud: environment.name === "AzureCustomCloud",
  };
}
