// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from "vscode";
import { TelemetryClient } from "../common/telemetryClient";
import { TelemetryEvent, TelemetryProperties } from "../common/telemetryEvent";
import { ApiRulesetOptions, azureApiGuidelineRulesetFile, defaultRulesetFile, SpectralExtensionId, spectralOwaspRulesetFile } from "../constants";
import { UiStrings } from "../uiStrings";
import { ensureExtension } from "../utils/ensureExtension";
import { setRulesetFile } from "../utils/ruleUtils";

const rulesetFileTypes = ['json', 'yml', 'yaml', 'js', "mjs", "cjs"];

export async function setApiRuleset(context: IActionContext) {
    ensureExtension(context, {
        extensionId: SpectralExtensionId,
        noExtensionErrorMessage: UiStrings.NoSpectralExtension,
    });

    const apiRulesetOption = await vscode.window.showQuickPick(Object.values(ApiRulesetOptions), { title: UiStrings.SetApiStyleGuide, ignoreFocusOut: true });

    if (apiRulesetOption) {
        TelemetryClient.sendEvent(TelemetryEvent.setApiRulesetSelectOption, { [TelemetryProperties.option]: apiRulesetOption });
    }

    switch (apiRulesetOption) {
        case ApiRulesetOptions.default:
            await setRulesetFile(defaultRulesetFile);
            break;
        case ApiRulesetOptions.azureApiGuideline:
            await setRulesetFile(azureApiGuidelineRulesetFile);
            break;
        case ApiRulesetOptions.spectralOwasp:
            await setRulesetFile(spectralOwaspRulesetFile);
            break;
        case ApiRulesetOptions.activeFile:
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                throw new Error(UiStrings.NoActiveFileOpen);
            }
            await setRulesetFile(activeEditor.document.uri.fsPath);
            break;
        case ApiRulesetOptions.selectFile:
            const fileUri = await vscode.window.showOpenDialog({
                openLabel: UiStrings.SelectRulesetFile,
                filters: { [UiStrings.Ruleset]: rulesetFileTypes }
            });
            if (fileUri && fileUri[0]) {
                await setRulesetFile(fileUri[0].fsPath);
            }
            break;
        case ApiRulesetOptions.inputUrl:
            const fileURL = await vscode.window.showInputBox({
                title: UiStrings.RemoteUrlRuleset,
                ignoreFocusOut: true,
                validateInput: text => {
                    if (!text) {
                        return UiStrings.ValueNotBeEmpty;
                    }
                    if (!text.startsWith('http://') && !text.startsWith('https://')) {
                        return UiStrings.ValidUrlStart;
                    }
                    if (!rulesetFileTypes.some(type => text.endsWith(`.${type}`))) {
                        return UiStrings.ValidUrlType;
                    }
                }
            });
            if (fileURL) {
                await setRulesetFile(fileURL);
            }
            break;
    }
}
