// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { DataPlaneAccount } from '../../../../azure/ApiCenter/ApiCenterDataPlaneAPIs';
import { DataPlaneAccountsKey } from '../../../../constants';
import { getOrSelectActiveAccount } from '../../../../copilot/utils/dataPlaneUtil';
import { ext } from '../../../../extensionVariables';

describe('getOrSelectActiveAccount', () => {
    let sandbox: sinon.SinonSandbox;
    let getStub: sinon.SinonStub;
    let updateStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        getStub = sandbox.stub();
        updateStub = sandbox.stub();
        ext.context = {
            globalState: {
                get: getStub,
                update: updateStub
            }
        } as any;
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should throw error when no accounts exist', async () => {
        // Setup: Return empty array from globalState.get
        getStub.returns([]);

        await assert.rejects(
            () => getOrSelectActiveAccount(),
            (err: Error) => {
                assert.match(err.message, /No Data Plane account found/);
                return true;
            }
        );
    });

    it('should return single account when only one exists', async () => {
        const account: DataPlaneAccount = {
            clientId: 'client1',
            tenantId: 'tenant1',
            domain: 'domain1',
            isActive: false
        };

        // Setup: Return array with single account
        getStub.returns([account]);

        const result = await getOrSelectActiveAccount();
        assert.deepStrictEqual(result, account);
    });

    it('should return active account when multiple accounts exist', async () => {
        const accounts: DataPlaneAccount[] = [
            { clientId: 'client1', tenantId: 'tenant1', domain: 'domain1', isActive: false },
            { clientId: 'client2', tenantId: 'tenant2', domain: 'domain2', isActive: true },
            { clientId: 'client3', tenantId: 'tenant3', domain: 'domain3', isActive: false }
        ];

        // Setup: Return array with multiple accounts
        getStub.returns(accounts);

        const result = await getOrSelectActiveAccount();
        assert.deepStrictEqual(result, accounts[1]);
    });

    it('should prompt user to select account when no active account exists', async () => {
        const accounts: DataPlaneAccount[] = [
            { clientId: 'client1', tenantId: 'tenant1', domain: 'domain1', isActive: false },
            { clientId: 'client2', tenantId: 'tenant2', domain: 'domain2', isActive: false }
        ];

        // Setup: Return array with multiple accounts but none active
        getStub.returns(accounts);

        // Mock vscode.window.showQuickPick to simulate user selection
        const showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
        (showQuickPickStub as any).callsFake(async (items: string[]) => 'domain1');

        const result = await getOrSelectActiveAccount();

        // Verify QuickPick was called with the correct domains
        const calledItems = showQuickPickStub.firstCall.args[0];
        assert.deepStrictEqual(calledItems, ['domain1', 'domain2']);

        // Verify selected account was marked as active and saved
        assert.strictEqual(result, accounts[0]);
        assert.strictEqual(accounts[0].isActive, true);
        sinon.assert.calledWith(updateStub, DataPlaneAccountsKey, accounts);
    });

    it('should throw error when user cancels selection', async () => {
        const accounts: DataPlaneAccount[] = [
            { clientId: 'client1', tenantId: 'tenant1', domain: 'domain1', isActive: false },
            { clientId: 'client2', tenantId: 'tenant2', domain: 'domain2', isActive: false }
        ];

        // Setup: Return array with multiple accounts but none active
        getStub.returns(accounts);

        // Mock vscode.window.showQuickPick to simulate user cancellation
        sandbox.stub(vscode.window, 'showQuickPick').resolves(undefined);

        await assert.rejects(
            () => getOrSelectActiveAccount(),
            (err: Error) => {
                assert.match(err.message, /User cancelled the selection/);
                return true;
            }
        );
    });
});
