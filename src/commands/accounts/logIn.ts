// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.


import { IActionContext } from '@microsoft/vscode-azext-utils';
import { ext } from '../../extensionVariables';

let _isLoggingIn: boolean = false;

export async function logIn(context: IActionContext): Promise<void> {
    try {
        const provider = await ext.subscriptionProviderFactory();
        _isLoggingIn = true;
        ext.treeItem.refresh(context); // Refresh to cause the "logging in" spinner to show
        await provider.signIn();
    } finally {
        _isLoggingIn = false;
        ext.treeItem.refresh(context); // Refresh now that sign in is complete
    }
}

export function isLoggingIn(): boolean {
    return _isLoggingIn;
}
