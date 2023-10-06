import * as vscode from 'vscode';
import { VSCodeAzureSubscriptionProvider } from '@microsoft/vscode-azext-azureauth';

export class Auth {
    public async getToken(): Promise<void> {

        // Sign in the user to Azure
        const azureSubscriptionProvider = new VSCodeAzureSubscriptionProvider();
        const signInResult = await azureSubscriptionProvider.signIn();

        // Cancel if user does not successfully sign in
        if (!signInResult) {
            return;
        }

        // Fetch subscriptions for identity
        const subscriptions = await azureSubscriptionProvider.getSubscriptions();

        // Show quick pick UI to pick a subscription
        const subscriptionItems = subscriptions.map((s) => ({
            label: s.name,
            description: s.subscriptionId,
            subscription: s
        }));
        const subscriptionItem = await vscode.window.showQuickPick(subscriptionItems, {
            placeHolder: 'Select a subscription'
        });

        // Cancel if user does not select a subscription
        if (!subscriptionItem) {
            return;
        }

        // Fetch a token for the selected subscription
        await subscriptionItem.subscription.authentication.getSession();
        console.log("it worked");
    }
}