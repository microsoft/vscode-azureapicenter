// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { UserCancelledError } from '@microsoft/vscode-azext-utils';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { DataPlaneAccount } from '../../../azure/ApiCenter/ApiCenterDataPlaneAPIs';
import { setActiveDataPlaneAccount } from '../../../commands/setActiveDataPlaneAccount';
import { ext } from '../../../extensionVariables';
import { UiStrings } from '../../../uiStrings';

describe('setActiveDataPlaneAccount', () => {
    let sandbox: sinon.SinonSandbox;
    let globalStateGetStub: sinon.SinonStub;
    let globalStateUpdateStub: sinon.SinonStub;
    let showQuickPickStub: sinon.SinonStub;
    let showInformationMessageStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        ext.context = {
            globalState: {
                get: () => { },
                update: () => Promise.resolve()
            }
        } as unknown as vscode.ExtensionContext;

        globalStateGetStub = sandbox.stub(ext.context.globalState, 'get');
        globalStateUpdateStub = sandbox.stub(ext.context.globalState, 'update');
        showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
        showInformationMessageStub = sandbox.stub(vscode.window, 'showInformationMessage');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should set selected account as active and update global state', async () => {
        const testAccounts: DataPlaneAccount[] = [
            { domain: 'domain1', tenantId: 'tenant1', clientId: 'client1', isActive: false },
            { domain: 'domain2', tenantId: 'tenant2', clientId: 'client2', isActive: false }
        ];

        globalStateGetStub.returns(testAccounts);
        showQuickPickStub.resolves('domain2');

        await setActiveDataPlaneAccount();

        // Verify that the global state was updated with the correct active account
        assert.strictEqual(globalStateUpdateStub.calledOnce, true);
        const updatedAccounts = globalStateUpdateStub.firstCall.args[1];
        assert.strictEqual(updatedAccounts[0].isActive, false);
        assert.strictEqual(updatedAccounts[1].isActive, true);

        // Verify that the success message was shown
        sinon.assert.calledWith(showInformationMessageStub, vscode.l10n.t(UiStrings.DataPlaneAccountSetTo, 'domain2'));
    });

    it('should throw UserCancelledError when no account is selected', async () => {
        const testAccounts: DataPlaneAccount[] = [
            { domain: 'domain1', tenantId: 'tenant1', clientId: 'client1', isActive: false },
            { domain: 'domain2', tenantId: 'tenant2', clientId: 'client2', isActive: false }
        ];

        globalStateGetStub.returns(testAccounts);
        showQuickPickStub.resolves(undefined);

        await assert.rejects(
            setActiveDataPlaneAccount,
            (error: Error) => {
                assert.ok(error instanceof UserCancelledError);
                return true;
            }
        );

        // Verify that the global state was not updated
        assert.strictEqual(globalStateUpdateStub.called, false);
    });

    it('should handle empty accounts list', async () => {
        globalStateGetStub.returns([]);
        showQuickPickStub.resolves(undefined);

        await assert.rejects(
            setActiveDataPlaneAccount,
            (error: Error) => {
                assert.ok(error instanceof UserCancelledError);
                return true;
            }
        );

        // Verify quickPick was called with empty array
        sinon.assert.calledWith(showQuickPickStub, []);
        // Verify that the global state was not updated
        assert.strictEqual(globalStateUpdateStub.called, false);
    });

    it('should deactivate previously active account when setting new active account', async () => {
        const testAccounts: DataPlaneAccount[] = [
            { domain: 'domain1', tenantId: 'tenant1', clientId: 'client1', isActive: true },
            { domain: 'domain2', tenantId: 'tenant2', clientId: 'client2', isActive: false }
        ];

        globalStateGetStub.returns(testAccounts);
        showQuickPickStub.resolves('domain2');

        await setActiveDataPlaneAccount();

        // Verify that the global state was updated with the correct active account
        assert.strictEqual(globalStateUpdateStub.calledOnce, true);
        const updatedAccounts = globalStateUpdateStub.firstCall.args[1];
        assert.strictEqual(updatedAccounts[0].isActive, false);
        assert.strictEqual(updatedAccounts[1].isActive, true);

        // Verify that the success message was shown
        sinon.assert.calledWith(showInformationMessageStub, vscode.l10n.t(UiStrings.DataPlaneAccountSetTo, 'domain2'));
    });
});
