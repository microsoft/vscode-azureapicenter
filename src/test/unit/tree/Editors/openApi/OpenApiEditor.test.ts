// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { expect } from "chai";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ApiCenterService } from "../../../../../azure/ApiCenter/ApiCenterService";
import { ApiSpecExportResultFormat } from "../../../../../azure/ApiCenter/contracts";
import { OpenApiEditor } from "../../../../../tree/Editors/openApi/OpenApiEditor";
import { UiStrings } from "../../../../../uiStrings";

describe("OpenApiEditor.updateData", () => {
    let sandbox: sinon.SinonSandbox;
    let editor: OpenApiEditor;
    let fakeTreeItem: any;
    let apiCenterServiceStub: sinon.SinonStub;
    let withProgressStub: sinon.SinonStub;
    let showInfoStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        editor = new OpenApiEditor();

        fakeTreeItem = {
            subscription: "sub-id",
            id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test/providers/Microsoft.ApiCenter/services/apicenter/workspaces/default/apis/api/versions/v1/definitions/defName",
            apiCenterName: "apicenter",
            apiCenterApiName: "api",
            apiCenterApiVersionName: "v1",
            apiCenterApiVersionDefinition: {
                getSpecificationName: sandbox.stub().returns("specName"),
                getName: sandbox.stub().returns("defName"),
                getDefinitions: sandbox.stub().resolves({
                    format: ApiSpecExportResultFormat.inline,
                    value: "exported-spec"
                })
            }
        };

        // Stub ApiCenterService
        apiCenterServiceStub = sandbox.stub(ApiCenterService.prototype, "importSpecification").resolves();

        // Stub vscode.window.withProgress
        withProgressStub = sandbox.stub(vscode.window, "withProgress").callsFake(async (_opts, task) => {
            await task({ report: () => { } }, {
                isCancellationRequested: false,
                onCancellationRequested: () => ({ dispose: () => { } })
            });
            return undefined;
        });

        // Stub showInformationMessage
        showInfoStub = sandbox.stub(vscode.window, "showInformationMessage").returns(Promise.resolve(undefined));

        // Stub getData to return a known value
        sandbox.stub(editor, "getData").resolves("updated-data");
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should call ApiCenterService.importSpecification with correct arguments and return updated data", async () => {
        const result = await editor.updateData(fakeTreeItem, "new-spec-data");

        expect(apiCenterServiceStub.calledOnce).to.be.true;

        const [apiName, apiVersionName, defName, importPayload] = apiCenterServiceStub.firstCall.args;
        expect(apiName).to.equal(fakeTreeItem.apiCenterApiName);
        expect(apiVersionName).to.equal(fakeTreeItem.apiCenterApiVersionName);
        expect(defName).to.equal("defName");
        expect(importPayload).to.deep.equal({
            format: "inline",
            value: "new-spec-data",
            specification: { name: "specName" }
        });

        expect(showInfoStub.calledWith(UiStrings.SpecUploaded)).to.be.true;
        expect(result).to.equal("updated-data");
    });

    it("should get correct file name", async () => {
        const fileName = await editor.getFilename(fakeTreeItem, { fileType: ".yaml" });
        expect(fileName).to.equal("apicenter-api-v1-defName-tempFile.yaml");
    });
});
