// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { AzExtTreeDataProvider } from "@microsoft/vscode-azext-utils";
import { expect } from "chai";
import * as sinon from "sinon";
import { commands } from "vscode";
import { editApi } from "../../../commands/editApi";
import { ext } from "../../../extensionVariables";
import { ApiVersionDefinitionTreeItem } from "../../../tree/ApiVersionDefinitionTreeItem";
import { OpenApiEditor } from "../../../tree/Editors/openApi/OpenApiEditor";

describe("editApi", () => {
    let showTreeItemPickerStub: sinon.SinonStub;
    let showEditorStub: sinon.SinonStub;
    let executeCommandStub: sinon.SinonStub;
    let fakeNode: sinon.SinonStubbedInstance<ApiVersionDefinitionTreeItem>;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        fakeNode = sandbox.createStubInstance(ApiVersionDefinitionTreeItem);

        // Mock the ext properties that are used in the editApi command
        ext.treeDataProvider = new AzExtTreeDataProvider({} as any, "test");
        ext.openApiEditor = new OpenApiEditor();

        showTreeItemPickerStub = sandbox.stub(ext.treeDataProvider, "showTreeItemPicker").resolves(fakeNode as unknown as ApiVersionDefinitionTreeItem);
        showEditorStub = sandbox.stub(ext.openApiEditor, "showEditor").resolves();
        executeCommandStub = sandbox.stub(commands, "executeCommand").resolves();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should pick a node if not provided and open the editor", async () => {
        const actionContext = {} as any;
        await editApi(actionContext);

        expect(showTreeItemPickerStub.calledOnce).to.be.true;
        expect(showEditorStub.calledOnceWithExactly(fakeNode)).to.be.true;
        expect(executeCommandStub.calledWith('setContext', 'isEditorEnabled', true)).to.be.true;
    });

    it("should use provided node and open the editor", async () => {
        const actionContext = {} as any;
        await editApi(actionContext, fakeNode as unknown as ApiVersionDefinitionTreeItem);

        expect(showTreeItemPickerStub.notCalled).to.be.true;
        expect(showEditorStub.calledOnceWithExactly(fakeNode)).to.be.true;
        expect(executeCommandStub.calledWith('setContext', 'isEditorEnabled', true)).to.be.true;
    });
});
