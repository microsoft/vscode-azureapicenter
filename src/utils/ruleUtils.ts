// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { UiStrings } from "../uiStrings";

const rulesetFileKey = "rulesetFile";
const apiCenterFolder = ".api-center";

export async function setRulesetFile(newRulesetFile: string, alwaysShowSetInfo: boolean = true) {
    const spectralLinterConfig = vscode.workspace.getConfiguration("spectral");
    const currentRulesetFile = spectralLinterConfig.get<string>(rulesetFileKey);

    const needToUpdate = newRulesetFile !== currentRulesetFile;

    if (needToUpdate) {
        await spectralLinterConfig.update("rulesetFile", newRulesetFile, vscode.ConfigurationTarget.Global);
    }

    if (needToUpdate || alwaysShowSetInfo) {
        vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.RulesetFileSet, newRulesetFile));
    }
}

export function getApiCenterWorkspacePath(): string {
    return path.join(os.homedir(), apiCenterFolder);
}
