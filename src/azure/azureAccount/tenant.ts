// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { ext } from '../../extensionVariables';
export function isTenantFilteredOut(tenantId: string, accountId: string): boolean {
    const settings = ext.context.globalState.get<string[]>('unselectedTenants');
    if (settings) {
        if (settings.includes(getKeyForTenant(tenantId, accountId))) {
            return true;
        }
    }
    return false;
}

export function getKeyForTenant(tenantId: string, accountId: string): string {
    return `${tenantId}/${accountId}`;
}
