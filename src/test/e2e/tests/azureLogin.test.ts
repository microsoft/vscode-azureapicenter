// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { test } from '../baseTest';
test('select Tenant', async ({ workbox }) => {
    // wait API Center extension installed on VS Code.
    await workbox.getByRole("tab", { name: "API Center" }).isVisible();
    await workbox.getByRole('tab', { name: "API Center" }).locator('a').click();
    await workbox.getByRole('treeitem', { name: 'Select tenant...' }).isVisible();
});
