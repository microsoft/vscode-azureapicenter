// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect, test } from '../baseTest';
import { APICenter, TestENV, Timeout, VSCode } from '../utils/constants';
import VscodeOperator from '../utils/vscodeOperator';

test('select Tenant', async ({ workbox }) => {
    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    // wait API Center extension installed on VS Code.
    expect(await VscodeOperator.isSideTabItemExist(workbox, VSCode.TAB_API_CENTER)).toBeTruthy();
    await VscodeOperator.activeSideTab(workbox, VSCode.TAB_API_CENTER, Timeout.PREPARE_EXT);
    console.log('click subscription: ', TestENV.AZURE_SUBSCRIPTION_NAME!);
    expect(await VscodeOperator.isTreeItemExist(workbox, TestENV.AZURE_SUBSCRIPTION_NAME!)).toBeTruthy();
});
