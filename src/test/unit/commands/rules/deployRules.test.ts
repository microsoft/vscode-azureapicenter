// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IActionContext } from '@microsoft/vscode-azext-utils';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ApiCenterService } from '../../../../azure/ApiCenter/ApiCenterService';
import { deployRules } from '../../../../commands/rules/deployRules';
import { RulesTreeItem } from '../../../../tree/rules/RulesTreeItem';
import { UiStrings } from '../../../../uiStrings';
import * as fsUtil from '../../../../utils/fsUtil';
import * as zipUtils from '../../../../utils/zipUtils';

describe('deployRules', () => {
    let hasFilesStub: sinon.SinonStub;
    let zipFolderToBufferStub: sinon.SinonStub;
    let showWarningMessageStub: sinon.SinonStub;
    let showInformationMessageStub: sinon.SinonStub;
    let withProgressStub: sinon.SinonStub;
    let importRulesetStub: sinon.SinonStub;

    const mockContext: IActionContext = {} as IActionContext;
    const mockNode: RulesTreeItem = {
        getRulesFolderPath: () => '/mock/path',
        apiCenter: {
            id: '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test',
            name: 'mock-api-center'
        },
        parent: {
            subscription: 'mock-subscription'
        },
        configName: 'mock-config'
    } as unknown as RulesTreeItem;

    beforeEach(() => {
        hasFilesStub = sinon.stub(fsUtil, 'hasFiles');
        zipFolderToBufferStub = sinon.stub(zipUtils, 'zipFolderToBuffer');
        showWarningMessageStub = sinon.stub(vscode.window, 'showWarningMessage');
        showInformationMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
        withProgressStub = sinon.stub(vscode.window, 'withProgress');
        importRulesetStub = sinon.stub(ApiCenterService.prototype, 'importRuleset');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should show warning message if no files in rules folder', async () => {
        hasFilesStub.resolves(false);

        await deployRules(mockContext, mockNode);

        assert(showWarningMessageStub.calledOnce);
        assert(showWarningMessageStub.calledWith(vscode.l10n.t(UiStrings.NoRulesFolder, '/mock/path')));
    });

    it('should deploy rules successfully', async () => {
        hasFilesStub.resolves(true);
        zipFolderToBufferStub.resolves(Buffer.from('mock-content'));
        withProgressStub.callsFake(async (options, task) => {
            await task({ report: () => { } }, { isCancellationRequested: false });
        });
        importRulesetStub.resolves({ isSuccessful: true });

        await deployRules(mockContext, mockNode);

        assert(showInformationMessageStub.calledOnce);
        assert(showInformationMessageStub.calledWith(vscode.l10n.t(UiStrings.RulesDeployed, 'mock-api-center')));
    });

    it('should throw error if deployment fails', async () => {
        hasFilesStub.resolves(true);
        zipFolderToBufferStub.resolves(Buffer.from('mock-content'));
        withProgressStub.callsFake(async (options, task) => {
            await task({ report: () => { } }, { isCancellationRequested: false });
        });
        importRulesetStub.resolves({ isSuccessful: false, message: 'mock-error' });

        await assert.rejects(deployRules(mockContext, mockNode), new Error(vscode.l10n.t(UiStrings.FailedToDeployRules, 'Error: mock-error')));
    });
});
