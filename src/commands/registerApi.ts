import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { RegisterApiOptions } from "../constants";
import { ApisTreeItem } from "../tree/ApisTreeItem";
import { registerStepByStep } from "./registerApiSubCommands/registerStepByStep";

export async function registerApi(context: IActionContext, node?: ApisTreeItem) {
    const registerApiOption = await vscode.window.showQuickPick(Object.values(RegisterApiOptions), { title: 'Register API', ignoreFocusOut: true });

    switch (registerApiOption) {
        case RegisterApiOptions.stepByStep:
            await registerStepByStep(context, node);
            break;
    }
}
