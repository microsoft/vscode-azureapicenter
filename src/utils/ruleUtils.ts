// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as vscode from "vscode";
import { UiStrings } from "../uiStrings";

export namespace SetRulesetFile {
    const rulesetFileKey = "rulesetFile";

    export async function setRulesetFile(newRulesetFile: string, alwaysShowSetInfo: boolean = true) {
        const spectralLinterConfig = vscode.workspace.getConfiguration("spectral");
        const currentRulesetFile = spectralLinterConfig.get<string>(rulesetFileKey);

        const needToUpdate = newRulesetFile !== currentRulesetFile;

        if (needToUpdate) {
            await spectralLinterConfig.update("rulesetFile", newRulesetFile, vscode.ConfigurationTarget.Global);
        }

        if (!newRulesetFile) {
            vscode.window.showInformationMessage(UiStrings.RulesetFileSetAsNone);
        } else if (needToUpdate || alwaysShowSetInfo) {
            vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.RulesetFileSet, newRulesetFile));
        }
    }
}
