// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as azureUtils from "@microsoft/vscode-azext-azureutils";
import { AzExtParentTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from "sinon";
import { OpenInPortal } from "../../../commands/openInPortal";
import { ApiCenterTreeItem } from "../../../tree/ApiCenterTreeItem";
describe('handleUri test happy path', () => {
    let sandbox = null as any;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('openInPortal with no node', async () => {
        let stubSetAccountToExt = sandbox.stub(azureUtils, "openInPortal").resolves();
        await OpenInPortal.openInPortal({} as unknown as IActionContext, {} as unknown as AzExtParentTreeItem);
        sandbox.assert.notCalled(stubSetAccountToExt);
    });
    it("openInPortal happy path", async () => {
        let stubSetAccountToExt = sandbox.stub(azureUtils, "openInPortal").resolves();
        let node: ApiCenterTreeItem = new ApiCenterTreeItem({} as unknown as AzExtParentTreeItem, {} as unknown as any);
        await OpenInPortal.openInPortal({} as unknown as IActionContext, node);
        sandbox.assert.calledOnce(stubSetAccountToExt);
    });
});
