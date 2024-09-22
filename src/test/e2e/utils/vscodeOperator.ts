// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Page } from '@playwright/test';
import { Timeout, VSCode } from '../utils/constants';

export default class VscodeOperator {
    static async execCommandInCommandPalette(page: Page, command: string) {
        await page.keyboard.press(VSCode.CMD_PALETTE_KEY);
        await page.waitForTimeout(Timeout.CLICK_WAIT);
        const cmdPalette = await VscodeOperator.getCMDPalette(page);
        await cmdPalette.fill(command);
        await page.waitForTimeout(Timeout.CLICK_WAIT);
        await page.getByRole(VSCode.CMD_PALETTE_LIST).first().press(VSCode.ENTER);
        await page.waitForTimeout(Timeout.CLICK_WAIT);
    }

    static async getCMDPalette(page: Page) {
        return page.getByRole(VSCode.CMD_PALETTE, { name: VSCode.INPUT });
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
        await page.waitForTimeout(Timeout.CLICK_LONG_WAIT);
    }

    static async rightClickTreeItem(page: Page, treeItemName: string) {
        await page.getByRole(VSCode.TREE_ITEM, { name: treeItemName }).locator(VSCode.LINK).click({
            button: 'right'
        });
        await page.waitForTimeout(Timeout.CLICK_WAIT);
    }

    static async clickMenuItem(page: Page, menuItemName: string) {
        await page.getByRole(VSCode.MENU_ITEM, { name: menuItemName }).locator("span.action-label").click();
        await page.waitForTimeout(Timeout.PREPARE_EXT);
    }

    static async clickTreeItemChildLinkByText(page: Page, treeItemName: string, linkName: string) {
        await page.getByRole(VSCode.TREE_ITEM, { name: treeItemName }).locator(VSCode.LINK).filter({ hasText: linkName }).click();
        await page.waitForTimeout(Timeout.CLICK_LONG_WAIT);
    }

    static async clickTreeItemChildByLabel(page: Page, treeItemName: string, labelName: string) {
        await page.getByRole(VSCode.TREE_ITEM, { name: treeItemName }).getByLabel(labelName).click();
        await page.waitForTimeout(Timeout.CLICK_LONG_WAIT);
    }

    static async getCheckallCheckbox(page: Page) {
        return await page.waitForSelector('input.quick-input-check-all[type="checkbox"]', { timeout: Timeout.SHORT_WAIT });
    }

    static async checkallCheckbox(page: Page) {
        await (await VscodeOperator.getCheckallCheckbox(page)).check();
        await page.waitForTimeout(Timeout.CLICK_WAIT);
        await (await VscodeOperator.getCMDPalette(page)).press(VSCode.ENTER);
        await page.waitForTimeout(Timeout.CLICK_WAIT);
    }

    static async clickToolbarItem(page: Page, option: string) {
        await page.getByRole(VSCode.Toolbar, { name: option }).locator(VSCode.LINK).click();
        await page.waitForTimeout(Timeout.CLICK_WAIT);
    }

    static async clickListItemChildLinkByText(page: Page, listItemName: string, linkName: string) {
        await page.getByRole(VSCode.CMD_PALETTE_LIST, { name: listItemName }).locator(VSCode.LINK).filter({ hasText: linkName }).click();
        await page.waitForTimeout(Timeout.CLICK_WAIT);
    }

    static async getCurrentPageIframe(page: Page, iframeName: string) {
        // title is the iframe name
        return page.frameLocator("iframe[title='" + iframeName + "']");
    }
}
