// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { copyDeploymentUrl } from "../../../commands/copyDeploymentUrl";
import { ApiDeploymentTreeItem } from "../../../tree/ApiDeploymentTreeItem";

describe("copyDeploymentUrl", () => {
    let sandbox: sinon.SinonSandbox;
    let showInformationMessageStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        showInformationMessageStub = sandbox.stub(vscode.window, "showInformationMessage");
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should copy runtime URL to clipboard and show information message", async () => {
        const mockRuntimeUrl = "https://example.com";
        const mockNode = {
            apiCenterApiDeployment: {
                properties: {
                    server: {
                        runtimeUri: [mockRuntimeUrl],
                    },
                },
            },
        } as unknown as ApiDeploymentTreeItem;

        await copyDeploymentUrl({} as any, mockNode);

        assert.strictEqual(await vscode.env.clipboard.readText(), mockRuntimeUrl, "Clipboard should contain the runtime URL");
        assert.strictEqual(
            showInformationMessageStub.calledOnceWithExactly(`Runtime URL copied: ${mockRuntimeUrl}`),
            true,
            "showInformationMessage should be called with the correct message"
        );
    });
});
