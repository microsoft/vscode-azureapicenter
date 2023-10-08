
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { ApiCenter } from "./contracts";
import { ServiceClient, RequestPrepareOptions } from "@azure/ms-rest-js";
const { HttpHeaders } = require("@azure/ms-rest-js");

function getCredentialForToken(accessToken: any) {
    return {
      signRequest: (request: any) => {
        if (!request.headers) request.headers = new HttpHeaders();
        request.headers.set("Authorization", `Bearer ${accessToken}`);
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
      const query = `Resources | where type =~ 'microsoft.apicenter/services' `;
      return await this.runQuery(query);
  }

    public async runQuery(query: string): Promise<any> {
      const creds = getCredentialForToken(this.susbcriptionContext.credentials.getToken());
      const client = new ServiceClient(creds);

      const request: RequestPrepareOptions = {
        url: "https://management.azure.com/providers/Microsoft.ResourceGraph/resources?api-version=2021-03-01",
        method: "POST"
      };

      const requestBody = {
          subscriptions: [
              this.susbcriptionContext.subscriptionId
          ],
          options: { resultFormat: "objectArray" },
          query: query
      };

      request.body = JSON.stringify(requestBody);

      const response = await client.sendRequest(request);
      return response.parsedBody
    }
}