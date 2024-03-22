// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { TelemetryClient } from "../common/telemetryClient";
import { TelemetryEvent, TelemetryProperties } from "../common/telemetryEvent";
import { ApisTreeItem } from "../tree/ApisTreeItem";
import { UiStrings } from "../uiStrings";

export async function searchApi(context: IActionContext, node: ApisTreeItem) {
    const searchContent = await vscode.window.showInputBox({ title: UiStrings.SearchAPI, ignoreFocusOut: true });
    if (!searchContent) {
        return;
    }
    TelemetryClient.sendEvent(TelemetryEvent.registerApiSelectOption, { [TelemetryProperties.option]: searchContent });
    node.updateSearchContent(searchContent);
    node.refresh(context);
}
