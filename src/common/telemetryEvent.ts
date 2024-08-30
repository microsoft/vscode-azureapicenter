// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export enum TelemetryEvent {
    copilotChat = "copilot-chat",
    treeviewListApiCenters = "treeview.listApiCenters",
    registerApiSelectOption = "registerApi.selectOption",
    setApiRulesetSelectOption = "setApiRuleset.selectOption",
    treeviewListDataPlane = "treeview.listDataPlaneServer",
    addDataPlaneApiFromDeepLink = "openDeepLink.addDataPlaneApi",
    addDataPlaneApiFromInput = "addDataPlaneApi.addDataPlaneApi"
}

export enum TelemetryProperties {
    duration = "duration",
    slashCommand = 'slashCommand',
    option = 'option',
    subscriptionId = 'subscriptionId',
    resourceName = 'resourceName',
    dataPlaneRuntimeUrl = 'dataPlaneRuntimeUrl',
    dataPlaneTenantId = "dataPlaneTenantId",
    dataPlaneClientId = "dataPlaneClientId",
};

export enum ErrorProperties {
    errorType = "errorType",
    errorMessage = "errorMessage",
};
