// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ApiSpecExportResultFormat } from "../../../azure/ApiCenter/contracts";
import { CreateDeclarativeAgent } from "../../../commands/createDeclarativeAgent";
import { ApiVersionDefinitionTreeItem } from "../../../tree/ApiVersionDefinitionTreeItem";
import { EnsureExtension } from "../../../utils/ensureExtension";
import { GeneralUtils } from "../../../utils/generalUtils";
import { treeUtils } from "../../../utils/treeUtils";

describe("CreateDeclarativeAgent", () => {
    let context: IActionContext;
    let node: ApiVersionDefinitionTreeItem;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        context = {} as IActionContext;
        node = {
            apiCenterApiVersionDefinition: {
                getDefinitions: sandbox.stub().resolves({ format: ApiSpecExportResultFormat.link, value: "apiSpecContent" }),
                getName: () => "apiCenterApiVersionDefinitionName"
            },
            subscription: "subscriptionId",
            apiCenterName: "apiCenterName",
            apiCenterApiName: "apiCenterApiName",
            apiCenterApiVersionName: "apiCenterApiVersionName"
        } as unknown as ApiVersionDefinitionTreeItem;
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should create declarative agent with provided node", async () => {
        const getDefinitionTreeNodeStub = sandbox.stub(treeUtils, "getDefinitionTreeNode").resolves(node);
        const ensureExtensionStub = sandbox.stub(EnsureExtension, "ensureExtension");
        const fetchDataFromLinkStub = sandbox.stub(GeneralUtils, "fetchDataFromLink").resolves("fetchedData");
        const writeApiSpecToTemporaryFileStub = sandbox.stub(CreateDeclarativeAgent, "writeApiSpecToTemporaryFile").resolves(vscode.Uri.file("tempFilePath"));
        const executeCommandStub = sandbox.stub(vscode.commands, "executeCommand").resolves();

        await CreateDeclarativeAgent.createDeclarativeAgent(context, node);

        sinon.assert.notCalled(getDefinitionTreeNodeStub);
        sinon.assert.calledOnce(ensureExtensionStub);
        sinon.assert.calledOnce(fetchDataFromLinkStub);
        sinon.assert.calledOnce(writeApiSpecToTemporaryFileStub);
        sinon.assert.calledOnce(executeCommandStub);
    });

    it("should create declarative agent without provided node", async () => {
        const getDefinitionTreeNodeStub = sandbox.stub(treeUtils, "getDefinitionTreeNode").resolves(node);
        const ensureExtensionStub = sandbox.stub(EnsureExtension, "ensureExtension");
        const fetchDataFromLinkStub = sandbox.stub(GeneralUtils, "fetchDataFromLink").resolves("fetchedData");
        const writeApiSpecToTemporaryFileStub = sandbox.stub(CreateDeclarativeAgent, "writeApiSpecToTemporaryFile").resolves(vscode.Uri.file("tempFilePath"));
        const executeCommandStub = sandbox.stub(vscode.commands, "executeCommand").resolves();

        await CreateDeclarativeAgent.createDeclarativeAgent(context);

        sinon.assert.calledOnce(getDefinitionTreeNodeStub);
        sinon.assert.calledOnce(ensureExtensionStub);
        sinon.assert.calledOnce(fetchDataFromLinkStub);
        sinon.assert.calledOnce(writeApiSpecToTemporaryFileStub);
        sinon.assert.calledOnce(executeCommandStub);
    });

    it("should return if no node is found", async () => {
        const getDefinitionTreeNodeStub = sandbox.stub(treeUtils, "getDefinitionTreeNode").resolves(undefined);
        const ensureExtensionStub = sandbox.stub(EnsureExtension, "ensureExtension");
        const fetchDataFromLinkStub = sandbox.stub(GeneralUtils, "fetchDataFromLink");
        const writeApiSpecToTemporaryFileStub = sandbox.stub(CreateDeclarativeAgent, "writeApiSpecToTemporaryFile").resolves(vscode.Uri.file("tempFilePath"));
        const executeCommandStub = sandbox.stub(vscode.commands, "executeCommand");

        await CreateDeclarativeAgent.createDeclarativeAgent(context);

        sinon.assert.calledOnce(getDefinitionTreeNodeStub);
        sinon.assert.notCalled(ensureExtensionStub);
        sinon.assert.notCalled(fetchDataFromLinkStub);
        sinon.assert.notCalled(writeApiSpecToTemporaryFileStub);
        sinon.assert.notCalled(executeCommandStub);
    });
});
