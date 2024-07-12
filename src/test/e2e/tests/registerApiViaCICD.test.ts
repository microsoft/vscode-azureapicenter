// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { expect, test } from '../baseTest';

test('trigger generateAPIviaCICD with Azure DevOps', async ({ workbox }) => {
    // wait API Center extension installed on VS Code.
    await workbox.getByRole("tab", { name: "API Center" }).isVisible();
    // trigger command palette.
    await workbox.keyboard.press('Control+Shift+KeyP');
    await workbox.getByRole("combobox", { name: "INPUT" }).fill('>Azure API Center: Register API');
    await workbox.getByRole('listbox').first().press('Enter');
    // select the first option.
    await workbox.getByRole('option', { name: "CI/CD" }).locator('a').click();
    // select the next option.
    await workbox.getByRole('option', { name: 'Azure DevOps' }).locator('a').click();
    // check result.
    await expect(workbox.getByRole('treeitem', { name: 'register-api.yml' })).toHaveCount(1);
});

test('trigger generateAPIviaCICD with GitHub', async ({ workbox }) => {
    // wait API Center extension installed on VS Code.
    await workbox.getByRole("tab", { name: "API Center" }).isVisible();
    // trigger command palette.
    await workbox.keyboard.press('Control+Shift+KeyP');
    await workbox.getByRole("combobox", { name: "INPUT" }).fill('>Azure API Center: Register API');
    await workbox.getByRole('listbox').first().press('Enter');
    // select the first option.
    await workbox.getByRole('option', { name: "CI/CD" }).locator('a').click();
    // select the next option.
    await workbox.getByRole('option', { name: 'GitHub' }).locator('a').click();
    // check result.
    await expect(workbox.getByRole('treeitem', { name: 'register-api.yml' })).toHaveCount(1);
});
