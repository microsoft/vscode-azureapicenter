"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorProperties = exports.TelemetryProperties = exports.TelemetryEvent = void 0;
var TelemetryEvent;
(function (TelemetryEvent) {
    TelemetryEvent["copilotChat"] = "copilot-chat";
    TelemetryEvent["treeviewListApiCenters"] = "treeview.listApiCenters";
})(TelemetryEvent || (exports.TelemetryEvent = TelemetryEvent = {}));
var TelemetryProperties;
(function (TelemetryProperties) {
    TelemetryProperties["duration"] = "duration";
    TelemetryProperties["slashCommand"] = "slashCommand";
})(TelemetryProperties || (exports.TelemetryProperties = TelemetryProperties = {}));
;
var ErrorProperties;
(function (ErrorProperties) {
    ErrorProperties["errorType"] = "errorType";
    ErrorProperties["errorMessage"] = "errorMessage";
})(ErrorProperties || (exports.ErrorProperties = ErrorProperties = {}));
;
//# sourceMappingURL=telemetryEvent.js.map