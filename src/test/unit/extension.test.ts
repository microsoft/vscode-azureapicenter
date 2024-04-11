// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as assert from "assert";
import * as vscode from "vscode";

suite("API Center: Extension Tests", () => {
    test("Should be present", () => {
        assert.ok(vscode.extensions.getExtension("apidev.azure-api-center"));
    });
    // tslint:disable-next-line: only-arrow-functions
    test("should be able to activate the extension", function (done) {
        this.timeout(60 * 1000);
        const extension: any = vscode.extensions.getExtension("apidev.azure-api-center");
        if (!extension.isActive) {
            extension.activate().then((api: any) => {
                done();
            }, () => {
                done("Failed to activate extension");
            });
        } else {
            done();
        }
    });

    test("should be able to register APICenter commands", () => {
        return vscode.commands.getCommands(true).then((commands: string[]) => {
            const APICENTER_COMMANDS = [
                'azure-api-center.selectSubscriptions',
                'azure-api-center.importOpenApiByFile',
                'azure-api-center.importOpenApiByLink',
                'azure-api-center.exportApi',
                'azure-api-center.showOpenApi',
                'azure-api-center.open-api-docs',
                'azure-api-center.open-postman',
                'azure-api-center.generate-api-client',
                'azure-api-center.generateHttpFile',
                'azure-api-center.registerApi',
                'azure-api-center.searchApi',
                'azure-api-center.cleanupSearchResult',
                'azure-api-center.setApiRuleset',
                'azure-api-center.detectBreakingChange',
                'azure-api-center.apiCenterTreeView.refresh'
            ];

            const foundAPICenterCommands = commands.filter((value) => {
                return APICENTER_COMMANDS.indexOf(value) >= 0 || value.startsWith("azure-api-center.");
            });

            const errorMsg = "Some API Center commands are not registered properly or a new command is not added to the test";
            assert.equal(foundAPICenterCommands.length, APICENTER_COMMANDS.length, errorMsg);
        });
    });
});
