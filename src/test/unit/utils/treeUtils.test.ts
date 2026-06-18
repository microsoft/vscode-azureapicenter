// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { ext } from "../../../extensionVariables";
import { treeUtils } from "../../../utils/treeUtils";

describe("treeUtils test case", () => {
    let sandbox = null as any;
    const resourcesPath = path.join("fake", "resources");
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        ext.context = {
            asAbsolutePath: (relativePath: string) => path.join("fake", relativePath),
        } as unknown as vscode.ExtensionContext;
    });
    afterEach(() => {
        sandbox.restore();
    });
    it("getIconPath returns a Uri pointing to the svg", () => {
        const iconPath = treeUtils.getIconPath("apiCenter") as vscode.Uri;
        assert.strictEqual(iconPath.scheme, "file");
        assert.strictEqual(iconPath.fsPath, vscode.Uri.file(path.join(resourcesPath, "apiCenter.svg")).fsPath);
    });
    it("getThemedIconPath returns light and dark Uris", () => {
        const iconPath = treeUtils.getThemedIconPath("apiCenter") as { light: vscode.Uri; dark: vscode.Uri; };
        assert.strictEqual(iconPath.light.scheme, "file");
        assert.strictEqual(iconPath.light.fsPath, vscode.Uri.file(path.join(resourcesPath, "light", "apiCenter.svg")).fsPath);
        assert.strictEqual(iconPath.dark.scheme, "file");
        assert.strictEqual(iconPath.dark.fsPath, vscode.Uri.file(path.join(resourcesPath, "dark", "apiCenter.svg")).fsPath);
    });
});
