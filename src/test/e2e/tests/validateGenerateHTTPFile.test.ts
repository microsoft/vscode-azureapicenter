// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect, test } from '../baseTest';
import { RestClient, Timeout, VSCode } from '../utils/constants';
import VscodeOperator from '../utils/vscodeOperator';

test('validate Generate HTTP File', { tag: ["@26611996"] }, async ({ workbox }) => {
    //set test timeout
    test.setTimeout(160000);
    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    // wait API Center extension installed on VS Code.
    expect(await VscodeOperator.isSideTabItemExist(workbox, "API Center")).toBeTruthy();
    await VscodeOperator.activeSideTab(workbox, VSCode.TAB_API_CENTER, Timeout.PREPARE_EXT);
    //expand and validate
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
    //right click on openai
    await VscodeOperator.rightClickTreeItem(workbox, "openapi");
    expect(await VscodeOperator.isMenuItemExist(workbox, "Generate HTTP File")).toBeTruthy();
    await VscodeOperator.clickMenuItem(workbox, "Generate HTTP File");
    await workbox.waitForTimeout(Timeout.LONG_WAIT);
    //validate the http file is opened
    expect(await VscodeOperator.isSideTabItemExist(workbox, "1-0-0-tempFile.http")).toBeTruthy();
    // trigger command palette.
    await VscodeOperator.execCommandInCommandPalette(workbox, RestClient.SEND_REQUEST);
    await workbox.waitForTimeout(Timeout.PREPARE_EXT);
    // check http result
    const requestFrame = await VscodeOperator.getHttpRequestFrame(workbox);
    expect(requestFrame.locator('span.hljs-number')).toContainText('200');
    console.log("[finsish] validate Generate HTTP File test");
});
