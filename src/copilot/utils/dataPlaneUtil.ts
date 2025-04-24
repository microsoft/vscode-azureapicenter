// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { ApiCenterDataPlaneService } from "../../azure/ApiCenter/ApiCenterDataPlaneAPIs";
import { AzureDataSessionProviderHelper, generateScopes } from "../../azure/azureLogin/dataSessionProvider";
import { ext } from "../../extensionVariables";
import { getSubscriptionContext } from "../../tree/DataPlaneAccount";
import { GeneralUtils } from "../../utils/generalUtils";

export async function createApiCenterDataPlaneService(): Promise<GeneralUtils.Errorable<ApiCenterDataPlaneService>> {
    if (ext.dataPlaneAccounts.length === 0) {
        return { succeeded: false, error: "No Data Plane account found. Let user trigger `Connect to an API Center` VS Code command to add Data Plane account" };
    }
    const account = ext.dataPlaneAccounts[0];

    const scopes = generateScopes(account.clientId, account.tenantId);
    const authSession = await AzureDataSessionProviderHelper.getSessionProvider().getAuthSession(scopes);
    if (GeneralUtils.failed(authSession)) {
        return { succeeded: false, error: `Let user sign in to Azure in 'Azure API Center Portal' Tree View. Error: ${authSession.error}` };
    }

    const subscriptionContext = getSubscriptionContext(account);

    const apiCenterDataPlaneService = new ApiCenterDataPlaneService(subscriptionContext);

    return { succeeded: true, result: apiCenterDataPlaneService };
}
