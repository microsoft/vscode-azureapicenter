// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect, test } from '../baseTest';
import { APICenter, Timeout, VSCode } from '../utils/constants';
import VscodeOperator from '../utils/vscodeOperator';

test('select Tenant', async ({ workbox }) => {
    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    // wait API Center extension installed on VS Code.
    expect(await VscodeOperator.isSideTabItemExist(workbox, VSCode.TAB_API_CENTER)).toBeTruthy();
    await VscodeOperator.activeSideTab(workbox, VSCode.TAB_API_CENTER, Timeout.PREPARE_EXT);
    // select tenant
    expect(await VscodeOperator.isTreeItemExist(workbox, APICenter.SELECT_TENANT)).toBeTruthy();
    await VscodeOperator.clickTreeItem(workbox, APICenter.SELECT_TENANT);
    await VscodeOperator.selectOptionByIndex(workbox, 0);
    // check subscription
    const isSelectSubsExist = await VscodeOperator.isTreeItemExist(workbox, APICenter.SELECT_SUBS);
    if (isSelectSubsExist) {
        // select subscription check all
        await VscodeOperator.clickTreeItem(workbox, APICenter.SELECT_SUBS);
        await VscodeOperator.checkallCheckbox(workbox);
    }
    expect(await VscodeOperator.isTreeItemExist(workbox, process.env["AZURE_SUBSCRIPTION_NAME"]!)).toBeTruthy();
});
