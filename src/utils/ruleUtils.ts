// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as path from 'path';
import * as vscode from "vscode";
import { UiStrings } from "../uiStrings";
import { getDefaultWorkspacePath, getSessionWorkingFolderName } from './fsUtil';

export async function getRulesFolderPath(apiCenterName: string): Promise<string> {
    return path.join(getDefaultWorkspacePath(), getSessionWorkingFolderName(), 'rules', apiCenterName);
}

export async function setRulesetFile(rulesetFile: string) {
    const spectralLinterConfig = vscode.workspace.getConfiguration("spectral");
    await spectralLinterConfig.update("rulesetFile", rulesetFile, vscode.ConfigurationTarget.Global);

    vscode.window.showInformationMessage(vscode.l10n.t(UiStrings.RulesetFileSet, rulesetFile));
}
