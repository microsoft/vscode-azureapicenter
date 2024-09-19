// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect, test } from '../baseTest';
import { APICenter, TestENV, Timeout, VSCode } from '../utils/constants';
import VscodeOperator from '../utils/vscodeOperator';

test('validate subscription', async ({ workbox }) => {
    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    // wait API Center extension installed on VS Code.
    expect(await VscodeOperator.isSideTabItemExist(workbox, "API Center")).toBeTruthy();
    await VscodeOperator.activeSideTab(workbox, VSCode.TAB_API_CENTER, Timeout.PREPARE_EXT);
    expect(await VscodeOperator.isTreeItemExist(workbox, "Teams Cloud - E2E Testing with TTL = 1 Days")).toBeTruthy();
});
