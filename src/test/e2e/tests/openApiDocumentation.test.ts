// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect, test } from '../baseTest';
import { Timeout, VSCode } from '../utils/constants';
import VscodeOperator from '../utils/vscodeOperator';

test('Open API Documentation test', { tag: ["@26611999"] }, async ({ workbox }) => {
    console.log("[start] Open API Documentation test");
    //set test timeout
    test.setTimeout(120000);

    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    // wait API Center extension installed on VS Code.
    expect(await VscodeOperator.isSideTabItemExist(workbox, "API Center")).toBeTruthy();
    await VscodeOperator.activeSideTab(workbox, VSCode.TAB_API_CENTER, Timeout.PREPARE_EXT);
    await workbox.waitForTimeout(Timeout.PREPARE_EXT);

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

    // right click on openapi and select "Open API Documentation"
    await VscodeOperator.rightClickTreeItem(workbox, "openapi");
    await VscodeOperator.clickMenuItem(workbox, "Open API Documentation");

    // validate the openapi documentation is opened
    const pageIframe = await VscodeOperator.getCurrentPageIframe(workbox, "callback-example");
    expect(pageIframe.getByText("Repair Service")).toBeTruthy();
    expect(pageIframe.getByText("A simple service to manage repairs")).toBeTruthy();
    expect(pageIframe.getByText("List all repairs")).toBeTruthy();
    console.log("[finish] Open API Documentation test");
});
