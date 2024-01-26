import { IActionContext } from "@microsoft/vscode-azext-utils";
import * as vscode from 'vscode';
import { TelemetryClient } from "../common/telemetryClient";
import { TelemetryEvent, TelemetryProperties } from "../common/telemetryEvent";
import { ApiRulesetOptions } from "../constants";
import { ensureExtension } from "../utils/ensureExtension";

export async function setApiRuleset(context: IActionContext) {
    ensureExtension(context, {
        extensionId: 'stoplight.spectral',
        noExtensionErrorMessage: 'Please install the Spectral extension to lint APIs.',
    });

    const apiRulesetOption = await vscode.window.showQuickPick(Object.values(ApiRulesetOptions), { title: 'Set API Design Compliance Ruleset', ignoreFocusOut: true });

    if (apiRulesetOption) {
        TelemetryClient.sendEvent(TelemetryEvent.setApiRulesetSelectOption, { [TelemetryProperties.option]: apiRulesetOption });
    }

    switch (apiRulesetOption) {
        case ApiRulesetOptions.azureApiGuideline:
            await setRulesetFile("https://raw.githubusercontent.com/azure/azure-api-style-guide/main/spectral.yaml");
            break;
        case ApiRulesetOptions.selectFile:
            const fileUri = await vscode.window.showOpenDialog({
                openLabel: "Select Ruleset File",
                filters: { ['Ruleset']: ['json', 'yml', 'yaml'] }
            });
            if (fileUri && fileUri[0]) {
                await setRulesetFile(fileUri[0].fsPath);
            }
            break;
        case ApiRulesetOptions.inputUrl:
            const fileURL = await vscode.window.showInputBox({
                title: 'Remote URL of Ruleset File',
                ignoreFocusOut: true,
                validateInput: text => {
                    if (!text) {
                        return "The value should not be empty.";
                    }
                    if (!text.startsWith('http://') && !text.startsWith('https://')) {
                        return 'Please enter a valid URL.';
                    }
                }
            });
            if (fileURL) {
                await setRulesetFile(fileURL);
            }
            break;
    }
}

async function setRulesetFile(rulesetFile: string) {
    const spectralLinterConfig = vscode.workspace.getConfiguration("spectral");
    await spectralLinterConfig.update("rulesetFile", rulesetFile, vscode.ConfigurationTarget.Global);

    vscode.window.showInformationMessage(`API Design Compliance Ruleset is set to '${rulesetFile}'.`);
}
