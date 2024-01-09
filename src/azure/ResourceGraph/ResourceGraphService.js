"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceGraphService = void 0;
const arm_resourcegraph_1 = require("@azure/arm-resourcegraph");
const credentialUtil_1 = require("../../utils/credentialUtil");
class ResourceGraphService {
    constructor(susbcriptionContext) {
        this.susbcriptionContext = susbcriptionContext;
    }
    async listApiCenters() {
        const query = "resources | where type =~ 'microsoft.apicenter/services'";
        return await this.runQuery(query);
    }
    async runQuery(query) {
        const creds = (0, credentialUtil_1.getCredentialForToken)(await this.susbcriptionContext.credentials.getToken());
        const client = new arm_resourcegraph_1.ResourceGraphClient(creds);
        const response = await client.resources({
            query: query,
            subscriptions: [
                this.susbcriptionContext.subscriptionId
            ]
        });
        return response.data;
    }
}
exports.ResourceGraphService = ResourceGraphService;
//# sourceMappingURL=ResourceGraphService.js.map