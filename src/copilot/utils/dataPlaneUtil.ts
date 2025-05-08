// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from 'vscode';
import { ApiCenterDataPlaneService, DataPlaneAccount } from "../../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { AzureDataSessionProviderHelper, generateScopes } from "../../azure/azureLogin/dataSessionProvider";
import { DataPlaneAccountsKey } from "../../constants";
import { ext } from "../../extensionVariables";
import { getSubscriptionContext } from "../../tree/DataPlaneAccount";
import { UiStrings } from '../../uiStrings';
import { GeneralUtils } from "../../utils/generalUtils";

export async function createApiCenterDataPlaneService(): Promise<ApiCenterDataPlaneService> {
    const account = await getOrSelectActiveAccount();
    const scopes = generateScopes(account.clientId, account.tenantId);
    const authSession = await AzureDataSessionProviderHelper.getSessionProvider().getAuthSession(scopes);

    if (GeneralUtils.failed(authSession)) {
        throw new Error(`Please sign in to Azure in 'API Center Portal View' Tree View. Error: ${authSession.error}`);
    }

    const subscriptionContext = getSubscriptionContext(account);
    const apiCenterDataPlaneService = new ApiCenterDataPlaneService(subscriptionContext);

    return apiCenterDataPlaneService;
}

export async function getOrSelectActiveAccount(): Promise<DataPlaneAccount> {
    const accounts = ext.context.globalState.get<DataPlaneAccount[]>(DataPlaneAccountsKey, []);

    if (accounts.length === 0) {
        throw new Error("No Data Plane account found. Please trigger `Connect to an API Center` VS Code command to add Data Plane account, and then sign in to connect this account");
    }

    if (accounts.length === 1) {
        return accounts[0];
    }

    const activeAccount = accounts.find(account => account.isActive);
    if (activeAccount) {
        return activeAccount;
    }

    const selectedAccount = await vscode.window.showQuickPick(accounts.map(account => account.domain), {
        placeHolder: vscode.l10n.t(UiStrings.SelectDataPlaneAccount),
        ignoreFocusOut: true,
    });

    if (!selectedAccount) {
        throw new Error("User cancelled the selection of Data Plane account.");
    }
    const selectedAccountIndex = accounts.findIndex(account => account.domain === selectedAccount);
    accounts[selectedAccountIndex].isActive = true;
    await ext.context.globalState.update(DataPlaneAccountsKey, accounts);

    return accounts[selectedAccountIndex];
}
