// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { expect, test } from '../baseTest';
import { APICenter, Timeout, VSCode } from '../utils/constants';
import VscodeOperator from '../utils/vscodeOperator';

// Set tags[0] used as test plan case id
test('trigger generateAPIviaCICD with Azure DevOps', { tag: ["@26627281"] }, async ({ workbox }) => {
    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    // wait API Center extension installed on VS Code.
    expect(await VscodeOperator.isSideTabItemExist(workbox, "API Center")).toBeTruthy();
    await VscodeOperator.activeSideTab(workbox, VSCode.TAB_API_CENTER);
    // trigger command palette.
    await VscodeOperator.execCommandInCommandPalette(workbox, APICenter.REGISTER_API);
    // select the first option.
    await VscodeOperator.selectOptionByName(workbox, APICenter.CI_CD);
    // select the next option.
    await VscodeOperator.selectOptionByName(workbox, APICenter.AZURE_DEVOPS);
    await VscodeOperator.activeSideTab(workbox, VSCode.TAB_EXPLORER);
    // check result.
    expect(await VscodeOperator.isSideTabItemExist(workbox, "register-api.yml")).toBeTruthy();
});

test('trigger generateAPIviaCICD with GitHub', { tag: ["@26625756"] }, async ({ workbox }) => {
    await workbox.waitForTimeout(Timeout.PREPARE_TEST);
    // wait API Center extension installed on VS Code.
    expect(await VscodeOperator.isSideTabItemExist(workbox, "API Center")).toBeTruthy();
    await VscodeOperator.activeSideTab(workbox, VSCode.TAB_API_CENTER);
    // trigger command palette.
    await VscodeOperator.execCommandInCommandPalette(workbox, APICenter.REGISTER_API);
    // select the first option.
    await VscodeOperator.selectOptionByName(workbox, APICenter.CI_CD);
    // select the next option.
    await VscodeOperator.selectOptionByName(workbox, APICenter.GITHUB);
    await VscodeOperator.activeSideTab(workbox, VSCode.TAB_EXPLORER);
    // check result.
    expect(await VscodeOperator.isSideTabItemExist(workbox, "register-api.yml")).toBeTruthy();
});
