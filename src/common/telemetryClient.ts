"use strict";
import TelemetryReporter from "@vscode/extension-telemetry";
import * as vscode from "vscode";
import { loadPackageInfo } from "../utils/packageUtils";

export class TelemetryClient {
    private static _client: TelemetryReporter;

    public static async initialize(context: vscode.ExtensionContext) {
        const packageInfo = await loadPackageInfo(context);
        this._client = new TelemetryReporter(`${packageInfo.publisher}.${packageInfo.name}`, packageInfo.version, packageInfo.aiKey, true);
    }

    public static sendEvent(eventName: string, properties?: { [key: string]: string; }): void {
        this._client.sendTelemetryEvent(eventName, properties);
    }

    public static sendErrorEvent(eventName: string, properties?: { [key: string]: string; }): void {
        this._client.sendTelemetryErrorEvent(eventName, properties);
    }
}
