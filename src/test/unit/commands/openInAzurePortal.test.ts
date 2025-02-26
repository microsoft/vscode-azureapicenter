// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import * as proxyquire from 'proxyquire';
import * as sinon from "sinon";
import { ApiCenterTreeItem } from "../../../tree/ApiCenterTreeItem";

describe('handleUri test happy path', () => {
    let sandbox: sinon.SinonSandbox
    let openInPortalStub: sinon.SinonStub;
    let openInPortalCommand: any;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    beforeEach(() => {
        openInPortalStub = sandbox.stub().resolves();

        // Mock the entire openInPortal module with proxyquire
        openInPortalCommand = proxyquire('../../../commands/openInAzurePortal', {
            '@microsoft/vscode-azext-azureutils': {
                openInPortal: openInPortalStub
            }
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('openInPortal with no node', async () => {
        await openInPortalCommand.default({} as unknown as IActionContext, undefined);
        sandbox.assert.notCalled(openInPortalStub);
    });

    it("openInPortal happy path", async () => {
        // Create a mock node with the fullId property
        let node = new ApiCenterTreeItem({} as unknown as AzExtParentTreeItem, {} as unknown as any);
        // Add the fullId property that openInPortalInternal uses
        Object.defineProperty(node, 'fullId', {
            get: () => 'test-full-id'
        });

        await openInPortalCommand.default({} as unknown as IActionContext, node);
        sandbox.assert.calledOnce(openInPortalStub);
        sandbox.assert.calledWith(openInPortalStub, node, 'test-full-id');
    });
});
