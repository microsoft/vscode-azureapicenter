// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as fs from "fs-extra";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { RegisterViaCICD } from "../../../../commands/registerApiSubCommands/registerViaCICD";

describe("test registerViaCICD", () => {
    let sandbox = null as any;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        cleanUpWorkspace();
        sandbox.restore();
    });
    function cleanUpWorkspace() {
        const workspaceFolder = vscode.workspace.workspaceFolders;
        if (workspaceFolder) {
            const workspacePath = workspaceFolder[0].uri.fsPath;
            if (fs.existsSync(path.join(workspacePath, ".github"))) {
                fs.removeSync(path.join(workspacePath, ".github"));
            }
            if (fs.existsSync(path.join(workspacePath, ".azure-pipelines"))) {
                fs.removeSync(path.join(workspacePath, ".azure-pipelines"));
            }
        }
    }
    it("registerViaCICD happy path with github", async () => {
        sandbox.stub(RegisterViaCICD, "getTemplatesFolder").callsFake(() => {
            const tempPath = path.join(__dirname, "..", "..", "..", "..", "..", "templates");
            return tempPath;
        });
        const stubQiuckPick = sandbox.stub(vscode.window, "showQuickPick").resolves("GitHub" as any);
        const showTextDocument = sandbox.stub(vscode.window, "showTextDocument").resolves();
        await RegisterViaCICD.registerViaCICD({} as unknown as IActionContext);
        const workspaceFolder = vscode.workspace.workspaceFolders;
        assert.ok(workspaceFolder);
        assert.ok(workspaceFolder![0].uri.fsPath);
        assert.ok(await fs.pathExists(path.join(workspaceFolder![0].uri.fsPath, ".github", "workflows", "register-api.yml")));
        const content = fs.readFileSync(path.join(workspaceFolder![0].uri.fsPath, ".github", "workflows", "register-api.yml"), "utf8");
        const expectedContent = fs.readFileSync(path.join(__dirname, "..", "..", "..", "resources", "yaml", "github.yml"), "utf8");
        assert.equal(content, expectedContent);
        sandbox.assert.calledOnce(stubQiuckPick);
        sandbox.assert.calledOnce(showTextDocument);
    });
    it("registerViaCICD happy path with azurepipelines", async () => {
        sandbox.stub(RegisterViaCICD, "getTemplatesFolder").callsFake(() => {
            const tempPath = path.join(__dirname, "..", "..", "..", "..", "..", "templates");
            return tempPath;
        });
        const stubQiuckPick = sandbox.stub(vscode.window, "showQuickPick").resolves("Azure DevOps" as any);
        const showTextDocument = sandbox.stub(vscode.window, "showTextDocument").resolves();
        await RegisterViaCICD.registerViaCICD({} as unknown as IActionContext);
        const workspaceFolder = vscode.workspace.workspaceFolders;
        assert.ok(workspaceFolder);
        assert.ok(workspaceFolder![0].uri.fsPath);
        assert.ok(await fs.pathExists(path.join(workspaceFolder![0].uri.fsPath, ".azure-pipelines", "register-api.yml")));
        const content = fs.readFileSync(path.join(workspaceFolder![0].uri.fsPath, ".azure-pipelines", "register-api.yml"), "utf8");
        const expectedContent = fs.readFileSync(path.join(__dirname, "..", "..", "..", "resources", "yaml", "azure.yml"), "utf8");
        assert.equal(content, expectedContent);
        sandbox.assert.calledOnce(stubQiuckPick);
        sandbox.assert.calledOnce(showTextDocument);
    });
    it('registerViaCICD with cancel', async () => {
        const stubQiuckPick = sandbox.stub(vscode.window, "showQuickPick").resolves(undefined);
        const showTextDocument = sandbox.stub(vscode.window, "showTextDocument").resolves();
        await RegisterViaCICD.registerViaCICD({} as unknown as IActionContext);
        sandbox.assert.calledOnce(stubQiuckPick);
        const workspaceFolder = vscode.workspace.workspaceFolders;
        assert.ok(!await fs.pathExists(path.join(workspaceFolder![0].uri.fsPath, ".github")));
        assert.ok(!await fs.pathExists(path.join(workspaceFolder![0].uri.fsPath, ".azure-pipelines")));
        sandbox.assert.notCalled(showTextDocument);
    });
    it('throw error when no workspace folder', async () => {
        sinon.stub(vscode.workspace, "workspaceFolders").get(() => undefined);
        try {
            await RegisterViaCICD.registerViaCICD({} as unknown as IActionContext);
        } catch (error) {
            assert.equal((error as Error).message, "Open a workspace in Visual Studio Code to generate a CI/CD pipeline.");
        }
    });
});
