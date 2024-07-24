// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Page } from '@playwright/test';
import { Timeout, VSCode } from '../utils/constants';

export default class VscodeOperator {
    static async execCommandInCommandPalette(page: Page, command: string) {
        await page.keyboard.press(VSCode.CMD_PALETTE_KEY);
        await page.waitForTimeout(Timeout.CLICK_WAIT);
        await page.getByRole(VSCode.CMD_PALETTE, { name: VSCode.INPUT }).fill(command);
        await page.waitForTimeout(Timeout.CLICK_WAIT);
        await page.getByRole(VSCode.CMD_PALETTE_LIST).first().press(VSCode.ENTER);
        await page.waitForTimeout(Timeout.CLICK_WAIT);
    }

    static async selectOptionByName(page: Page, option: string) {
        await page.getByRole(VSCode.CMD_PALETTE_OPTION, { name: option }).locator(VSCode.LINK).click();
        await page.waitForTimeout(Timeout.CLICK_WAIT);
    }

    static async selectOptionByIndex(page: Page, index: number) {
        await page.getByRole(VSCode.CMD_PALETTE_OPTION).nth(index).locator(VSCode.LINK).click();
        await page.waitForTimeout(Timeout.CLICK_WAIT);
    }

    static async activeSideTab(page: Page, tabName: string, timeout = Timeout.CLICK_WAIT) {
        await page.getByRole(VSCode.SIDE_TAB, { name: tabName }).locator(VSCode.LINK).click();
        await page.waitForTimeout(timeout);
    }

    static async isSideTabItemExist(page: Page, tabName: string) {
        return await page.getByRole(VSCode.SIDE_TAB, { name: tabName }).isVisible();
    }

    static async isTreeItemExist(page: Page, treeItemName: string) {
        return await page.getByRole(VSCode.TREE_ITEM, { name: treeItemName }).isVisible();
    }

    static async clickTreeItem(page: Page, treeItemName: string) {
        await page.getByRole(VSCode.TREE_ITEM, { name: treeItemName }).locator(VSCode.LINK).click();
        await page.waitForTimeout(Timeout.CLICK_WAIT);
    }
}

