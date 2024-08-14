// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect, test } from '../baseTest';
import { Timeout, VSCode } from '../utils/constants';
import VscodeOperator from '../utils/vscodeOperator';

test('validate azure tree view', async ({ workbox }) => {
    //set test timeout
    test.setTimeout(120000);

    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    // wait API Center extension installed on VS Code.
    expect(await VscodeOperator.isSideTabItemExist(workbox, "API Center")).toBeTruthy();
    await VscodeOperator.activeSideTab(workbox, VSCode.TAB_API_CENTER, Timeout.PREPARE_EXT);
    expect(await VscodeOperator.isTreeItemExist(workbox, "Teams Cloud - E2E Testing with TTL = 1 Days")).toBeTruthy();
    //expand and validate tree
    await VscodeOperator.clickTreeItemChildLinkByText(workbox, "Teams Cloud - E2E Testing with TTL = 1 Days", "Teams Cloud - E2E Testing with TTL = 1 Days");
    expect(await VscodeOperator.isTreeItemExist(workbox, "apicentertest001")).toBeTruthy();
    await VscodeOperator.clickTreeItem(workbox, "apicentertest001");
    expect(await VscodeOperator.isTreeItemExist(workbox, "APIs")).toBeTruthy();
    await VscodeOperator.clickTreeItemChildLinkByText(workbox, "APIs", "APIs");
    expect(await VscodeOperator.isTreeItemExist(workbox, "callback-example")).toBeTruthy();
    await VscodeOperator.clickTreeItem(workbox, "callback-example");
    expect(await VscodeOperator.isTreeItemExist(workbox, "Versions")).toBeTruthy();
    await VscodeOperator.clickTreeItem(workbox, "Versions");
    expect(await VscodeOperator.isTreeItemExist(workbox, "1-0-0")).toBeTruthy();
    await VscodeOperator.clickTreeItem(workbox, "1-0-0");
    expect(await VscodeOperator.isTreeItemExist(workbox, "Definitions")).toBeTruthy();
    await VscodeOperator.clickTreeItem(workbox, "Definitions");
    expect(await VscodeOperator.isTreeItemExist(workbox, "openapi")).toBeTruthy();

    //click Refresh
    await VscodeOperator.clickToolbarItem(workbox, "API Center actions");
    await workbox.waitForTimeout(Timeout.PREPARE_EXT);
    expect(await VscodeOperator.isTreeItemExist(workbox, "Teams Cloud - E2E Testing with TTL = 1 Days")).toBeTruthy();
    expect(await VscodeOperator.isTreeItemExist(workbox, "openapi")).toBeTruthy();

    //select another Subscription
    await VscodeOperator.clickTreeItemChildLinkByText(workbox, "Teams Cloud - E2E Testing with TTL = 1 Days", "Teams Cloud - E2E Testing with TTL = 1 Days");
    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    await VscodeOperator.clickTreeItemChildByLabel(workbox, "Teams Cloud - E2E Testing with TTL = 1 Days", "Select Subscriptions...");
    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    var cmdPalette = await VscodeOperator.getCMDPalette(workbox);
    await cmdPalette.fill("Teams Cloud - E2E Testing with TTL = 1 Days");
    await workbox.waitForTimeout(Timeout.CLICK_WAIT);
    await workbox.getByRole("listbox", { name: "Select Subscriptions" }).locator(VSCode.LINK).filter({ hasText: "Teams Cloud - E2E Testing with TTL = 1 Days" }).click();
    await workbox.waitForTimeout(Timeout.CLICK_WAIT);
    cmdPalette.clear();
    cmdPalette.fill("Teams Cloud - Dev Test with TTL = 3 Days");
    await workbox.waitForTimeout(Timeout.CLICK_WAIT);
    await workbox.getByRole("listbox", { name: "Select Subscriptions" }).locator(VSCode.LINK).filter({ hasText: "Teams Cloud - Dev Test with TTL = 3 Days" }).click();
    await workbox.waitForTimeout(Timeout.CLICK_WAIT);
    await cmdPalette.press(VSCode.ENTER);
    await workbox.waitForTimeout(Timeout.PREPARE_EXT);
    expect(await VscodeOperator.isTreeItemExist(workbox, "Teams Cloud - Dev Test with TTL = 3 Days")).toBeTruthy();
});
