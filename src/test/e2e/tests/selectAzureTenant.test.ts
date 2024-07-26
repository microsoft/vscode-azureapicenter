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
    console.log('select tenant: ', APICenter.SELECT_TENANT);
    // select tenant
    expect(await VscodeOperator.isTreeItemExist(workbox, APICenter.SELECT_TENANT)).toBeTruthy();
    console.log('click tenant: ', APICenter.SELECT_TENANT);
    await VscodeOperator.clickTreeItem(workbox, APICenter.SELECT_TENANT);
    console.log('select tenant name: ', TestENV.AZURE_TENANT_NAME);
    await VscodeOperator.selectOptionByName(workbox, TestENV.AZURE_TENANT_NAME!);
    // check subscription
    console.log('check subscription');
    const isSelectSubsExist = await VscodeOperator.isTreeItemExist(workbox, APICenter.SELECT_SUBS);
    if (isSelectSubsExist) {
        // select subscription check all
        console.log('check all: ', APICenter.SELECT_SUBS);
        await VscodeOperator.clickTreeItem(workbox, APICenter.SELECT_SUBS);
        await VscodeOperator.checkallCheckbox(workbox);
    }
    console.log('click subscription: ', TestENV.AZURE_SUBSCRIPTION_NAME!);
    expect(await VscodeOperator.isTreeItemExist(workbox, TestENV.AZURE_SUBSCRIPTION_NAME!)).toBeTruthy();
});
