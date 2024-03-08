// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { TelemetryClient } from "../common/telemetryClient";
import { TelemetryEvent, TelemetryProperties } from "../common/telemetryEvent";
import { RegisterApiOptions } from "../constants";
import { ApisTreeItem } from "../tree/ApisTreeItem";
import { UiStrings } from "../uiStrings";
import { registerStepByStep } from "./registerApiSubCommands/registerStepByStep";
import { RegisterViaCICD } from "./registerApiSubCommands/registerViaCICD";

export async function registerApi(context: IActionContext, node?: ApisTreeItem) {
    const registerApiOption = await vscode.window.showQuickPick(Object.values(RegisterApiOptions), { title: UiStrings.RegisterApi, ignoreFocusOut: true });

    if (registerApiOption) {
        TelemetryClient.sendEvent(TelemetryEvent.registerApiSelectOption, { [TelemetryProperties.option]: registerApiOption });
    }

    switch (registerApiOption) {
        case RegisterApiOptions.stepByStep:
            await registerStepByStep(context, node);
            break;
        case RegisterApiOptions.cicd:
            await RegisterViaCICD.registerViaCICD(context);
            break;
    }
}
