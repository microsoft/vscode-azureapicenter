// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { UserCancelledError } from '@microsoft/vscode-azext-utils';
import * as vscode from 'vscode';
import { DataPlaneAccount } from '../azure/ApiCenter/ApiCenterDataPlaneAPIs';
import { DataPlaneAccountsKey } from '../constants';
import { ext } from '../extensionVariables';
import { UiStrings } from '../uiStrings';

export async function setActiveDataPlaneAccount(): Promise<void> {
    const accounts = ext.context.globalState.get<DataPlaneAccount[]>(DataPlaneAccountsKey, []);

    const selectedAccount = await vscode.window.showQuickPick(accounts.map(account => account.domain), {
        placeHolder: vscode.l10n.t(UiStrings.SelectDataPlaneAccount),
        ignoreFocusOut: true,
    });

    if (!selectedAccount) {
        throw new UserCancelledError();
    }

    accounts.forEach(account => {
        account.isActive = false;
    });
    const selectedAccountIndex = accounts.findIndex(account => account.domain === selectedAccount);
    accounts[selectedAccountIndex].isActive = true;
    await ext.context.globalState.update(DataPlaneAccountsKey, accounts);

    vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.DataPlaneAccountSetTo, selectedAccount));
}
