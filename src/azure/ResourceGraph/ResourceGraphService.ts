// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ResourceGraphClient } from "@azure/arm-resourcegraph";
import { ISubscriptionContext } from "@microsoft/vscode-azext-utils";
import { clientOptions } from "../../common/clientOptions";
import { getCredentialForToken } from "../../utils/credentialUtil";
import { ApiCenter } from "../ApiCenter/contracts";

export class ResourceGraphService {
  private susbcriptionContext: ISubscriptionContext;
  constructor(susbcriptionContext: ISubscriptionContext) {
    this.susbcriptionContext = susbcriptionContext;
  }

  public async listApiCenters(): Promise<ApiCenter[]> {
    const query = "resources | where type =~ 'microsoft.apicenter/services'";
    return await this.runQuery(query);
  }

  public async listApims(): Promise<any[]> {
    const query = "resources | where type =~ 'microsoft.apimanagement/service'";
    return await this.runQuery(query);
  }

  public async queryApiCenterByName(name: string): Promise<ApiCenter[]> {
    const query = `resources | where type =~ 'microsoft.apicenter/services' | where name =~ '${name}'`;
    return await this.runQuery(query);
  }

  public async runQuery(query: string): Promise<any> {
    const creds = getCredentialForToken(await this.susbcriptionContext.credentials.getToken());
    const client = new ResourceGraphClient(creds, clientOptions);

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
