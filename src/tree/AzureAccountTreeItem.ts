// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Environment } from '@azure/ms-rest-azure-env';
import { AzureSubscription, AzureSubscriptionProvider, getUnauthenticatedTenants } from '@microsoft/vscode-azext-azureauth';
import {
  AzExtParentTreeItem,
  AzExtServiceClientCredentials,
  AzExtTreeItem,
  GenericTreeItem,
  ISubscriptionContext,
  registerEvent
} from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { AzureSessionProvider } from "../azure/azureLogin/authTypes";
import { AzureSubscriptionHelper } from "../azure/azureLogin/subscriptions";
import { isLoggingIn } from "../commands/accounts/logIn";
import { AzureAccountType } from "../constants";
import { ext } from "../extensionVariables";
import { UiStrings } from "../uiStrings";
import { createSubscriptionTreeItem } from "./SubscriptionTreeItem";
export function createAzureAccountTreeItem(
  sessionProvider: AzureSessionProvider,
): AzExtParentTreeItem & { dispose(): unknown } {
  return new AzureAccountTreeItem(sessionProvider);
}

export class AzureAccountTreeItem extends AzExtParentTreeItem {
  private subscriptionProvider: AzureSubscriptionProvider | undefined;
  // private statusSubscription: vscode.Disposable | undefined;
  private subscriptionTreeItems: AzExtTreeItem[] | undefined;
  public static contextValue: string = "azureApiCenterAzureAccount";
  public readonly contextValue: string = AzureAccountTreeItem.contextValue;
  public readonly childTypeLabel: string = UiStrings.AccountTreeItemChildTypeLabel;
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

  public dispose(): void { }

  public hasMoreChildrenImpl(): boolean {
    return false;
  }

  public async getAzureSubscriptionProvider(): Promise<AzureSubscriptionProvider> {
    // override for testing
    if (!this.subscriptionProvider) {
      this.subscriptionProvider = await ext.subscriptionProviderFactory();
    }

    return this.subscriptionProvider;

  }

  // no need to sort the array
  public compareChildrenImpl(item1: AzExtTreeItem, item2: AzExtTreeItem): number {
    return 0;
  }

  public async loadMoreChildrenImpl(): Promise<AzExtTreeItem[]> {
    const existingSubscriptionTreeItems: AzExtTreeItem[] = this.subscriptionTreeItems || [];
    this.subscriptionTreeItems = [];

    const subscriptionProvider = await this.getAzureSubscriptionProvider();
    if (subscriptionProvider) {
      if (isLoggingIn()) {
        return [
          new GenericTreeItem(this, {
            label: UiStrings.Loading,
            contextValue: "azureCommand",
            id: "azureapicenterAccountLoading",
            iconPath: new vscode.ThemeIcon("loading~spin"),
          }),
        ]
      } else if (await subscriptionProvider.isSignedIn()) {
        let subscriptions: AzureSubscription[];
        if ((subscriptions = await subscriptionProvider.getSubscriptions(true)).length === 0) {
          if (
            // If there are no subscriptions at all (ignoring filters) AND if unauthenicated tenants exist
            (await subscriptionProvider.getSubscriptions(false)).length === 0 &&
            (await getUnauthenticatedTenants(subscriptionProvider)).length > 0
          ) {
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
          } else {
            return [
              new GenericTreeItem(this, {
                label: UiStrings.SelectSubscriptions,
                commandId: "azure-api-center.selectSubscriptions",
                contextValue: "azureCommand",
                id: "azureapicenterSubscription",
                includeInTreeItemPicker: true,
              }),
            ];
          }
        } else {
          this.subscriptionTreeItems = await Promise.all(
            subscriptions.map(async (subscription: any) => {
              const existingTreeItem: AzExtTreeItem | undefined = existingSubscriptionTreeItems.find(
                (ti) => ti.id === subscription.subscriptionId,
              );
              if (existingTreeItem) {
                return existingTreeItem;
              } else {
                const subscriptionContext = createSubscriptionContext(subscription);
                return await createSubscriptionTreeItem(this, subscriptionContext);
              }
            }),
          );
        }
      } else {
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
      }
    }

    return this.subscriptionTreeItems!;
  }
}

function createSubscriptionContext(subscription: AzureSubscription): ISubscriptionContext {
  return {
    environment: Environment.AzureCloud,
    isCustomCloud: false,
    subscriptionDisplayName: subscription.name,
    subscriptionId: subscription.subscriptionId,
    subscriptionPath: '',
    tenantId: '',
    userId: '',
    credentials: createCredential(subscription.authentication.getSession)
  };
}

function createCredential(getSession: (scopes?: string[]) => vscode.ProviderResult<vscode.AuthenticationSession>): AzExtServiceClientCredentials {
  return {
    getToken: async (scopes?: string | string[]) => {
      if (typeof scopes === 'string') {
        scopes = [scopes];
      }

      const session = await getSession(scopes);

      if (session) {
        return {
          token: session.accessToken
        };
      } else {
        return null;
      }
    }
  };
}

