// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from "sinon";
import { ApiCenterVersionDefinitionManagement } from "../../../azure/ApiCenter/ApiCenterDefinition";
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

const data: ApiCenterApiVersionDefinition = {
    id: "fakeId",
    location: "fakeLocation",
    name: "fakeName",
    properties: {
        title: "fakeTitle",
        specification: {
            name: "fakeName",
            version: "fakeVersion",
        }
    },
    // tslint:disable-next-line:no-reserved-keywords
    type: "fakeType",
};

class RootTreeItem extends ParentTreeItemBase {
    public label: string = 'root';
    public contextValue: string = 'root';

    protected createChildTreeItem(index: number): AzExtTreeItem {
        return new ApiVersionDefinitionTreeItem(this, "fakeApiCenterName", "fakeApiCenterApiName", "fakeApiCenterApiVersionName", new ApiCenterVersionDefinitionManagement(data));
    }
}

describe("export API test cases", () => {
    let sandbox = null as any;
    let root: RootTreeItem;
    let node: ApiVersionDefinitionTreeItem;
    before(() => {
        sandbox = sinon.createSandbox();
        sinon.stub(TelemetryClient, "sendEvent").returns();
    });
    beforeEach(() => {
        root = new RootTreeItem(undefined);
        node = new ApiVersionDefinitionTreeItem(root,
            "fakeApiCenterName",
            "fakeApiCenterApiName",
            "fakeApiCenterApiVersionName",
            new ApiCenterVersionDefinitionManagement(data)
        );
        sandbox.stub(node, "subscription").value("fakeSub");
        sandbox.stub(node, "id").value("/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/test/workspaces/default/apis/test/versions/v1/definitions/openapi");
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('export API happy path with link type', async () => {
        let stubShowTempFile = sandbox.stub(ExportAPI, "showTempFile").resolves();
        sandbox.stub(node.apiCenterApiVersionDefinition, "getDefinitions").resolves({ format: "link", value: "fakeValue" });
        sandbox.stub(ExportAPI, "fetchDataFromLink").resolves();
        await ExportAPI.exportApi({} as IActionContext, node);
        sandbox.assert.calledOnce(stubShowTempFile);
    });
    it('export API happy path with inline type', async () => {
        let stubShowTempFile = sandbox.stub(ExportAPI, "showTempFile").resolves();
        sandbox.stub(node.apiCenterApiVersionDefinition, "getDefinitions").resolves({ format: "inline", value: "fakeValue" });
        await ExportAPI.exportApi({} as IActionContext, node);
        sandbox.assert.calledOnce(stubShowTempFile);
    });
});
