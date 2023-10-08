
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenter } from "./contracts";
import { ServiceClient, RequestPrepareOptions } from "@azure/ms-rest-js";
import { ResourceGraphClient } from "@azure/arm-resourcegraph";
const { HttpHeaders } = require("@azure/ms-rest-js");

function getCredentialForToken(accessToken: any) {
    return {
      signRequest: (request: any) => {
        if (!request.headers) request.headers = new HttpHeaders();
        request.headers.set("Authorization", `Bearer ${accessToken.token}`);
        return Promise.resolve(request);
      }
    };
}

export class ResourceGraphService { 
    private susbcriptionContext: ISubscriptionContext; 
    constructor(susbcriptionContext: ISubscriptionContext) {
        this.susbcriptionContext = susbcriptionContext;
    }

    public async listApiCenters(): Promise<ApiCenter[]> {
      const query = "resources | where type =~ 'microsoft.apicenter/services'";
      return await this.runQuery(query);
  }

    public async runQuery(query: string): Promise<any> {
      const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
      const client = new ResourceGraphClient(creds);

      const response = await client.resources(
        {
            query: query,
            subscriptions: [
              this.susbcriptionContext.subscriptionId
            ]
        }
     );

      return response.data;
    }
}