// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from "sinon";
import { ApiCenterService } from "../../../azure/ApiCenter/ApiCenterService";
import { ApiCenterApiVersionDefinition } from "../../../azure/ApiCenter/contracts";
import { ExportAPI } from "../../../commands/exportApi";
import { TelemetryClient } from "../../../common/telemetryClient";
import { ApiVersionDefinitionTreeItem } from "../../../tree/ApiVersionDefinitionTreeItem";
abstract class ParentTreeItemBase extends AzExtParentTreeItem {
    private _childIndex: number = 0;
    public async loadMoreChildrenImpl(clearCache: boolean, context: IActionContext): Promise<AzExtTreeItem[]> {
        const children: AzExtTreeItem[] = [];
        return children;
    }
    public hasMoreChildrenImpl(): boolean {
        return this._childIndex < 10;
    }
    protected abstract createChildTreeItem(index: number): AzExtTreeItem;
}

class RootTreeItem extends ParentTreeItemBase {
    public label: string = 'root';
    public contextValue: string = 'root';

    protected createChildTreeItem(index: number): AzExtTreeItem {
        return new ApiVersionDefinitionTreeItem(this, "fakeApiCenterName", "fakeApiCenterApiName", "fakeApiCenterApiVersionName", {} as ApiCenterApiVersionDefinition);
    }
}

suite("export API test cases", () => {
    let sandbox = null as any;
    let root: RootTreeItem;
    let node: ApiVersionDefinitionTreeItem;
    suiteSetup(() => {
        sandbox = sinon.createSandbox();
        sinon.stub(TelemetryClient, "sendEvent").returns();
    });
    setup(() => {
        root = new RootTreeItem(undefined);
        node = new ApiVersionDefinitionTreeItem(root,
            "fakeApiCenterName",
            "fakeApiCenterApiName",
            "fakeApiCenterApiVersionName",
            {
                properties: {
                    specification: {
                        name: "fakeName"
                    }
                }
            } as ApiCenterApiVersionDefinition
        );
        sandbox.stub(node, "subscription").value("fakeSub");
        sandbox.stub(node, "id").value("/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/apis/test/versions/v1/definitions/openapi");
    });
    teardown(() => {
        sandbox.restore();
    });
    test('export API happy path with link type', async () => {
        const spyShowTempFile = sandbox.spy(ExportAPI, "showTempFile");
        sandbox.stub(ApiCenterService.prototype, "exportSpecification").resolves({ format: "link", value: "fakeValue" });
        await ExportAPI.exportApi({} as IActionContext, node);
        sandbox.assert.notCalled(spyShowTempFile);
    });
    test('export API happy path with inline type', async () => {
        let stubShowTempFile = sandbox.stub(ExportAPI, "showTempFile").resolves();
        sandbox.stub(ApiCenterService.prototype, "exportSpecification").resolves({ format: "inline", value: "fakeValue" });
        await ExportAPI.exportApi({} as IActionContext, node);
        sandbox.assert.calledOnce(stubShowTempFile);
    });
});
