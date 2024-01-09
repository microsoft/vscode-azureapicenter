"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryClient = void 0;
const extension_telemetry_1 = require("@vscode/extension-telemetry");
const packageUtils_1 = require("../utils/packageUtils");
class TelemetryClient {
    static async initialize(context) {
        const packageInfo = await (0, packageUtils_1.loadPackageInfo)(context);
        this._client = new extension_telemetry_1.default(`${packageInfo.publisher}.${packageInfo.name}`, packageInfo.version, packageInfo.aiKey, true);
    }
    static sendEvent(eventName, properties) {
        this._client.sendTelemetryEvent(eventName, properties);
    }
    static sendErrorEvent(eventName, properties) {
        this._client.sendTelemetryErrorEvent(eventName, properties);
    }
}
exports.TelemetryClient = TelemetryClient;
//# sourceMappingURL=telemetryClient.js.map