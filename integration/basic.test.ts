// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { expect, test } from './baseTest';

test('trigger command', async ({ workbox }) => {
    // trigger command palette.
    await workbox.keyboard.press('Control+Shift+KeyP');
    await workbox.getByTitle('Type the name of a command to run.').fill('>Azure API Center: Register API');
    await workbox.getByRole('listbox').first().press('Enter');
    // select the first option.
    await workbox.getByRole('option', { name: "CI/CD" }).locator('a').click();
    // select the next option.
    await workbox.getByRole('option', { name: 'GitHub' }).locator('a').click();
    // check result.
    await expect(workbox.getByRole('treeitem', { name: 'register-api.yml' })).toHaveCount(1);
})
