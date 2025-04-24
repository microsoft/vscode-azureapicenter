// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as sinon from "sinon";
import * as vscode from 'vscode';
import { removeDataplaneAPI } from "../../../commands/removeDataplaneApi";
import { ext } from "../../../extensionVariables";
import { ApiServerItem } from "../../../tree/DataPlaneAccount";
describe('removeDataplaneAPI test happy path', () => {
    let sandbox = null as any;
    let node: ApiServerItem;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    beforeEach(() => {
        sinon.restore();
        function gloablStateKeys(): readonly string[] {
            return ["PrereleaseState.Version"];
        }
        function globalStateGet(key: string): string {
            return "0.0.0";
        }
        function globalStateUpdate(key: string, value: any): any { }
        const mockGlobalState: vscode.Memento = {
            keys: gloablStateKeys,
            get: globalStateGet,
            update: globalStateUpdate,
        };
        ext.context = {
            subscriptions: [],
            globalState: mockGlobalState,
            extension: {
                packageJSON: {
                    name: "azure-api-center",
                    publisher: "apidev",
                    displayName: "Azure API Center",
                    description: "Build, discover, and consume APIs.",
                    version: "1.0.0",
                    bugsUrl: "https://fake_url",
                    aiKey: "fake_Aikey"
                }
            }
        } as unknown as vscode.ExtensionContext;
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('removeDataplaneAPI happy path', async () => {
        sandbox.stub(ext.context.globalState, 'get').returns([
            { domain: "domain1", tenantId: "tenantId1", clientId: "clientId1" },
            { domain: "domain2", tenantId: "tenantId2", clientId: "clientId2" }
        ]);
        const subscription = {
            subscriptionPath: "domain1",
            tenantId: "tenantId1",
            userId: "clientId1",
            credentials: {} as any,
            subscriptionDisplayName: "",
            subscriptionId: "",
            environment: {} as any,
            isCustomCloud: false
        };
        const updateStub = sandbox.stub(ext.context.globalState, 'update').returns();
        const exeCmdStub = sandbox.stub(vscode.commands, 'executeCommand').returns();
        node = new ApiServerItem({} as any, subscription);
        await removeDataplaneAPI({} as IActionContext, node);
        sandbox.assert.calledOnce(updateStub);
        sandbox.assert.calledWith(updateStub, 'azure-api-center.dataPlaneAccounts', [
            { domain: "domain2", tenantId: "tenantId2", clientId: "clientId2" }
        ]);
        sandbox.assert.calledOnce(exeCmdStub);
    });
});
