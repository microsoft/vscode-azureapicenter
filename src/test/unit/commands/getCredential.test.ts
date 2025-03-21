// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { createAzExtOutputChannel, IActionContext } from '@microsoft/vscode-azext-utils';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { ApiCenterApiCredential } from '../../../azure/ApiCenter/contracts';
import { getCredential } from '../../../commands/getCredential';
import { ext } from '../../../extensionVariables';
import { ApiAccessTreeItem } from '../../../tree/ApiAccessTreeItem';

describe('getCredential', () => {
    let sandbox: sinon.SinonSandbox;
    let mockContext: IActionContext;
    let mockNode: ApiAccessTreeItem;
    let outputChannelAppendLineStub: sinon.SinonStub;
    let outputChannelShowStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        mockContext = {} as IActionContext;
        mockNode = {
            id: '/subscriptions/sub-id/resourceGroups/rg-name/providers/Microsoft.ApiCenter/apiCenters/api-center-name',
            parent: { subscription: 'sub-id' },
            apiCenterName: 'api-center-name',
            apiCenterApiName: 'api-name',
            apiCenterApiVersionName: 'api-version-name',
            apiCenterApiAccess: { name: 'access-name' }
        } as unknown as ApiAccessTreeItem;

        ext.outputChannel = createAzExtOutputChannel('Azure API Center', ext.prefix);
        outputChannelAppendLineStub = sandbox.stub(ext.outputChannel, 'appendLine');
        outputChannelShowStub = sandbox.stub(ext.outputChannel, 'show');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should retrieve credentials and log them to the output channel', async () => {
        const mockCredential: ApiCenterApiCredential = {
            securityScheme: "apiKey",
            apiKey: {
                value: "value",
                in: "query",
                name: "X-API-KEY"
            }
        };
        const getApiCenterApiCredentialStub = sandbox.stub(ApiCenterService.prototype, "getApiCenterApiCredential").resolves(mockCredential);

        await getCredential(mockContext, mockNode);

        sinon.assert.calledOnce(getApiCenterApiCredentialStub);
        sinon.assert.calledWithExactly(
            getApiCenterApiCredentialStub,
            'api-name',
            'api-version-name',
            'access-name'
        );
        sinon.assert.calledWithExactly(
            outputChannelAppendLineStub,
            "Credential for 'access-name':"
        );
        sinon.assert.calledWithExactly(
            outputChannelAppendLineStub,
            JSON.stringify(mockCredential, null, 2)
        );
        sinon.assert.calledOnce(outputChannelShowStub);
    });

    it('should handle errors gracefully', async () => {
        const error = new Error('Test error');
        const getApiCenterApiCredentialStub = sandbox.stub(ApiCenterService.prototype, "getApiCenterApiCredential").rejects(error);

        await assert.rejects(
            getCredential(mockContext, mockNode),
            new Error('Test error')
        );

        sinon.assert.calledOnce(getApiCenterApiCredentialStub);
        sinon.assert.notCalled(outputChannelShowStub);
    });
});
