import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { TelemetryClient } from "../common/telemetryClient";
import { TelemetryEvent, TelemetryProperties } from "../common/telemetryEvent";
import { ApisTreeItem } from "../tree/ApisTreeItem";

export async function searchApi(context: IActionContext, node: ApisTreeItem) {
    const searchContent = await vscode.window.showInputBox({ title: 'Search API', ignoreFocusOut: true, validateInput: validateInputForTitle });

    if (searchContent) {
        TelemetryClient.sendEvent(TelemetryEvent.registerApiSelectOption, { [TelemetryProperties.option]: searchContent });
        node.updateSearchContent(searchContent);
    }
    node.refresh(context);
}


function validateInputForTitle(value: string) {
    if (!value) {
        return "The value should not be empty.";
    }
}
