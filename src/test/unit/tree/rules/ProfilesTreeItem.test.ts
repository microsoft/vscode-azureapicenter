// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, IActionContext } from '@microsoft/vscode-azext-utils';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ApiCenterService } from '../../../../azure/ApiCenter/ApiCenterService';
import { ApiCenter } from '../../../../azure/ApiCenter/contracts';
import { ProfilesTreeItem } from '../../../../tree/rules/ProfilesTreeItem';
import { RulesTreeItem } from '../../../../tree/rules/RulesTreeItem';

describe('ProfilesTreeItem', () => {
    let parent: AzExtParentTreeItem;
    let apiCenter: ApiCenter;
    let profilesTreeItem: ProfilesTreeItem;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        parent = <AzExtParentTreeItem>{ subscription: {} };
        apiCenter = <ApiCenter>{ id: '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test', name: 'test-name' };
        profilesTreeItem = new ProfilesTreeItem(parent, apiCenter);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should have correct context value', () => {
        assert.strictEqual(ProfilesTreeItem.contextValue, 'azureApiCenterProfiles');
        assert.strictEqual(profilesTreeItem.contextValue, 'azureApiCenterProfiles');
    });

    it('should return correct label', () => {
        assert.strictEqual(profilesTreeItem.label, "Profiles");
    });

    it('should return correct icon path', () => {
        const iconPath = profilesTreeItem.iconPath;
        assert(iconPath instanceof vscode.ThemeIcon);
        assert.strictEqual((iconPath as vscode.ThemeIcon).id, 'symbol-ruler');
    });

    it('should load children correctly', async () => {
        const analyzerConfigs = [
            { id: '1', type: 'type1', name: 'config1', properties: {} },
            { id: '2', type: 'type2', name: 'config2', properties: {} }
        ];
        const apiCenterServiceStub = sandbox.stub(ApiCenterService.prototype, 'getApiCenterAnalyzerConfigs').resolves({ value: analyzerConfigs });
        sandbox.stub(profilesTreeItem, 'createTreeItemsWithErrorHandling').resolves(analyzerConfigs.map(config => new RulesTreeItem(profilesTreeItem, apiCenter, config.name)));

        const children = await profilesTreeItem.loadMoreChildrenImpl(false, <IActionContext>{});

        assert(apiCenterServiceStub.calledOnce);
        assert.strictEqual(children.length, 2);
        assert(children[0] instanceof RulesTreeItem);
        assert(children[1] instanceof RulesTreeItem);
    });

    it('should indicate no more children', () => {
        assert.strictEqual(profilesTreeItem.hasMoreChildrenImpl(), false);
    });

    it('should handle no analysis configs gracefully', async () => {
        const apiCenterServiceStub = sandbox.stub(ApiCenterService.prototype, 'getApiCenterAnalyzerConfigs').resolves(undefined);

        const children = await profilesTreeItem.loadMoreChildrenImpl(false, <IActionContext>{});

        assert(apiCenterServiceStub.calledOnce);
        assert.strictEqual(children.length, 0);
    });
});
