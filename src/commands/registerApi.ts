import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { TelemetryClient } from "../common/telemetryClient";
import { TelemetryEvent, TelemetryProperties } from "../common/telemetryEvent";
import { RegisterApiOptions } from "../constants";
import { ApisTreeItem } from "../tree/ApisTreeItem";
import { registerStepByStep } from "./registerApiSubCommands/registerStepByStep";
import { registerViaCICD } from "./registerApiSubCommands/registerViaCICD";

export async function registerApi(context: IActionContext, node?: ApisTreeItem) {
    const registerApiOption = await vscode.window.showQuickPick(Object.values(RegisterApiOptions), { title: 'Register API', ignoreFocusOut: true });

    if (registerApiOption) {
        TelemetryClient.sendEvent(TelemetryEvent.registerApiSelectOption, { [TelemetryProperties.option]: registerApiOption });
    }

    switch (registerApiOption) {
        case RegisterApiOptions.stepByStep:
            await registerStepByStep(context, node);
            break;
        case RegisterApiOptions.cicd:
            await registerViaCICD(context);
            break;
    }
}
