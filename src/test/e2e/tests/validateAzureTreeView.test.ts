// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect, test } from '../baseTest';
import { APICenter, Timeout, VSCode } from '../utils/constants';
import VscodeOperator from '../utils/vscodeOperator';

test('validate azure tree view', async ({ workbox }) => {
    //set test timeout
    test.setTimeout(120000);

    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    // wait API Center extension installed on VS Code.
    expect(await VscodeOperator.isSideTabItemExist(workbox, "API Center")).toBeTruthy();
    await VscodeOperator.activeSideTab(workbox, VSCode.TAB_API_CENTER, Timeout.PREPARE_EXT);

    //expand and validate tree items
    await VscodeOperator.clickTreeItemChildLinkByText(workbox, "Teams Cloud - E2E Testing with TTL = 1 Days", "Teams Cloud - E2E Testing with TTL = 1 Days");
    expect(await VscodeOperator.isTreeItemExist(workbox, "apicentertest001")).toBeTruthy();
    await VscodeOperator.clickTreeItem(workbox, "apicentertest001");
    expect(await VscodeOperator.isTreeItemExist(workbox, "APIs")).toBeTruthy();
    expect(await VscodeOperator.isTreeItemExist(workbox, "Environments")).toBeTruthy();
    expect(await VscodeOperator.isTreeItemExist(workbox, "Rules")).toBeTruthy();
    await VscodeOperator.clickTreeItemChildLinkByText(workbox, "APIs", "APIs");
    expect(await VscodeOperator.isTreeItemExist(workbox, "callback-example")).toBeTruthy();
    await VscodeOperator.clickTreeItem(workbox, "callback-example");
    expect(await VscodeOperator.isTreeItemExist(workbox, "Deployments")).toBeTruthy();
    expect(await VscodeOperator.isTreeItemExist(workbox, "Versions")).toBeTruthy();
    await VscodeOperator.clickTreeItem(workbox, "Versions");
    expect(await VscodeOperator.isTreeItemExist(workbox, "1-0-0")).toBeTruthy();
    await VscodeOperator.clickTreeItem(workbox, "1-0-0");
    expect(await VscodeOperator.isTreeItemExist(workbox, "Definitions")).toBeTruthy();
    await VscodeOperator.clickTreeItem(workbox, "Definitions");
    expect(await VscodeOperator.isTreeItemExist(workbox, "openapi")).toBeTruthy();

    //Refresh tree and verify
    await VscodeOperator.clickToolbarItem(workbox, "Azure API Center actions");
    await workbox.waitForTimeout(Timeout.PREPARE_EXT);
    expect(await VscodeOperator.isTreeItemExist(workbox, "Teams Cloud - E2E Testing with TTL = 1 Days")).toBeTruthy();
    expect(await VscodeOperator.isTreeItemExist(workbox, "openapi")).toBeTruthy();

    //select another Subscription: "AML Infra - Engineering System"
    //click "Select Subscriptions" link
    await VscodeOperator.clickTreeItemChildLinkByText(workbox, "Teams Cloud - E2E Testing with TTL = 1 Days", "Teams Cloud - E2E Testing with TTL = 1 Days");
    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    await VscodeOperator.clickTreeItemChildByLabel(workbox, "Teams Cloud - E2E Testing with TTL = 1 Days", APICenter.SELECT_SUBS);
    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    //select current subscription in command palette to remove it
    var cmdPalette = await VscodeOperator.getCMDPalette(workbox);
    await cmdPalette.fill("Teams Cloud - E2E Testing with TTL = 1 Days");
    await workbox.waitForTimeout(Timeout.CLICK_WAIT);
    await VscodeOperator.clickListItemChildLinkByText(workbox, "Select Subscriptions", "Teams Cloud - E2E Testing with TTL = 1 Days");
    cmdPalette.clear();
    //select new subscription
    cmdPalette.fill("AML Infra - Engineering System");
    await workbox.waitForTimeout(Timeout.CLICK_WAIT);
    await VscodeOperator.clickListItemChildLinkByText(workbox, "Select Subscriptions", "AML Infra - Engineering System");
    await cmdPalette.press(VSCode.ENTER);
    await workbox.waitForTimeout(Timeout.PREPARE_EXT);
    expect(await VscodeOperator.isTreeItemExist(workbox, "AML Infra - Engineering System")).toBeTruthy();
});
