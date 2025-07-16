// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { HttpOperationResponse, RequestPrepareOptions, ServiceClient } from "@azure/ms-rest-js";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { v4 as uuidv4 } from 'uuid';
import { clientOptions } from "../../common/clientOptions";
import { getCredentialForToken } from "../../utils/credentialUtil";
import { AzureRestAPIs } from "./AzureRestAPIs";
import { RoleAssignmentPayload } from "./contracts";

export class AzureService {
    private subscriptionContext: ISubscriptionContext;
    private apiVersion: string = "2022-04-01";
    constructor(subscriptionContext: ISubscriptionContext) {
        this.subscriptionContext = subscriptionContext;
    }

    public async createOrUpdateRoleAssignment(scope: string, roleAssignmentPayload: RoleAssignmentPayload): Promise<HttpOperationResponse> {
        const creds = getCredentialForToken(await this.subscriptionContext.credentials.getToken());
        const client = new ServiceClient(creds, clientOptions);
        const options: RequestPrepareOptions = {
            method: "PUT",
            url: AzureRestAPIs.CreateOrUpdateRoleAssignment(scope, uuidv4(), this.apiVersion),
            body: roleAssignmentPayload
        };
        const response = await client.sendRequest(options);
        return response;
    }
}
