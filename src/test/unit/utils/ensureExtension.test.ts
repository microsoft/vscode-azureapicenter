// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as assert from "assert";
import * as sinon from "sinon";
import { commands, extensions, l10n } from "vscode";
import { EnsureExtension } from "../../../utils/ensureExtension";

describe("EnsureExtension Tests", () => {
    let context: IActionContext;
    let getExtensionStub: sinon.SinonStub;
    let executeCommandStub: sinon.SinonStub;

    const extensionId = "some.extension";
    const noExtensionErrorMessage = "Extension not found";
    const minimumVersion = "1.0.0";

    beforeEach(() => {
        context = {
            errorHandling: {
                suppressReportIssue: false,
                buttons: []
            }
        } as unknown as IActionContext;

        getExtensionStub = sinon.stub(extensions, "getExtension");
        executeCommandStub = sinon.stub(commands, "executeCommand");
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should throw error if extension is not installed", () => {
        getExtensionStub.withArgs(extensionId).returns(undefined);

        assert.throws(() => {
            EnsureExtension.ensureExtension(context, { extensionId, noExtensionErrorMessage });
        }, new RegExp(noExtensionErrorMessage));

        assert.strictEqual(context.errorHandling.suppressReportIssue, true);
        assert.strictEqual(context.errorHandling.buttons?.length, 1);
        assert.strictEqual(context.errorHandling.buttons[0].title, l10n.t('Open Extension'));
    });

    it("should throw error if extension version is less than minimum required version", () => {
        const extension = {
            packageJSON: {
                version: "0.9.0"
            }
        };
        getExtensionStub.withArgs(extensionId).returns(extension);

        assert.throws(() => {
            EnsureExtension.ensureExtension(context, { extensionId, noExtensionErrorMessage, minimumVersion });
        }, new RegExp(noExtensionErrorMessage));

        assert.strictEqual(context.errorHandling.suppressReportIssue, true);
        assert.strictEqual(context.errorHandling.buttons?.length, 1);
        assert.equal(context.errorHandling.buttons[0].title, l10n.t('Open Extension'));
    });

    it("should not throw error if extension is installed and meets minimum version", () => {
        const extension = {
            packageJSON: {
                version: "1.0.0"
            }
        };
        getExtensionStub.withArgs(extensionId).returns(extension);

        assert.doesNotThrow(() => {
            EnsureExtension.ensureExtension(context, { extensionId, noExtensionErrorMessage, minimumVersion });
        });

        assert.strictEqual(context.errorHandling.suppressReportIssue, false);
        assert.strictEqual(context.errorHandling.buttons?.length, 0);
    });
});
