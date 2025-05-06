// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as ApiCenterDataPlaneAPIs from '../../../../azure/ApiCenter/ApiCenterDataPlaneAPIs';
import * as dataSessionProvider from '../../../../azure/azureLogin/dataSessionProvider';
import * as dataPlaneUtil from '../../../../copilot/utils/dataPlaneUtil';
import { ext } from '../../../../extensionVariables';
import * as dataPlaneAccount from '../../../../tree/DataPlaneAccount';
import * as generalUtils from '../../../../utils/generalUtils';

describe('createApiCenterDataPlaneService', () => {
    let sandbox: sinon.SinonSandbox; let generateScopesStub: sinon.SinonStub;
    let getSessionProviderStub: sinon.SinonStub;
    let getAuthSessionStub: sinon.SinonStub;
    let failedStub: sinon.SinonStub;
    let getSubscriptionContextStub: sinon.SinonStub;
    let ApiCenterDataPlaneServiceStub: sinon.SinonStub;

    const fakeAccount = { clientId: 'client', tenantId: 'tenant', domain: 'domain', isActive: true };
    const fakeScopes = ['scope1', 'scope2'];
    const fakeSubscriptionContext = { sub: 'context' };
    const fakeApiCenterDataPlaneService = { service: 'apiCenter' };

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        // Mock ext.context for getOrSelectActiveAccount
        const getStub = sandbox.stub().returns([fakeAccount]);
        const updateStub = sandbox.stub();
        ext.context = {
            globalState: {
                get: getStub,
                update: updateStub
            }
        } as any;
        generateScopesStub = sandbox.stub(dataSessionProvider, 'generateScopes').returns(fakeScopes);
        getAuthSessionStub = sandbox.stub().resolves({ accessToken: 'token' });
        getSessionProviderStub = sandbox.stub(dataSessionProvider.AzureDataSessionProviderHelper, 'getSessionProvider').returns({
            getAuthSession: getAuthSessionStub,
            signIn: sandbox.stub().resolves(),
            signInStatus: 'SignedIn',
            signInStatusChangeEvent: new (require('vscode')).EventEmitter().event,
            dispose: sandbox.stub()
        } as any);
        failedStub = sandbox.stub(generalUtils.GeneralUtils, 'failed').returns(false);
        getSubscriptionContextStub = sandbox.stub(dataPlaneAccount, 'getSubscriptionContext').returns(fakeSubscriptionContext as any);
        ApiCenterDataPlaneServiceStub = sandbox.stub(ApiCenterDataPlaneAPIs, 'ApiCenterDataPlaneService').returns(fakeApiCenterDataPlaneService as any);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create and return ApiCenterDataPlaneService instance', async () => {
        const result = await dataPlaneUtil.createApiCenterDataPlaneService();
        assert.strictEqual(result, fakeApiCenterDataPlaneService);
        sinon.assert.calledWith(generateScopesStub, fakeAccount.clientId, fakeAccount.tenantId);
        sinon.assert.calledWith(getAuthSessionStub, fakeScopes);
        sinon.assert.calledWith(getSubscriptionContextStub, fakeAccount);
        sinon.assert.calledWith(ApiCenterDataPlaneServiceStub, fakeSubscriptionContext);
    });

    it('should throw error if authSession failed', async () => {
        failedStub.returns(true);
        getAuthSessionStub.resolves({ error: 'auth error' });

        await assert.rejects(
            () => dataPlaneUtil.createApiCenterDataPlaneService(),
            (err: Error) => {
                assert.match(err.message, /Please sign in to Azure/);
                assert.match(err.message, /auth error/);
                return true;
            }
        );
    });
});
