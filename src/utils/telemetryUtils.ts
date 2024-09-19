// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AzExtTreeItem } from "@microsoft/vscode-azext-utils";
import { TelemetryProperties } from "../common/telemetryEvent";

export namespace TelemetryUtils {
    export function setAzureResourcesInfo(properties: { [key: string]: string; }, arg: any): void {
        if (arg && arg instanceof AzExtTreeItem) {
            if (arg.subscription.subscriptionId) {
                properties[TelemetryProperties.subscriptionId] = arg.subscription.subscriptionId;
            }
            // data plane has no subscriptionId but subscriptionPath.
            else if (arg.subscription.subscriptionPath && arg.subscription.tenantId && arg.subscription.userId) {
                properties[TelemetryProperties.dataPlaneRuntimeUrl] = arg.subscription.subscriptionPath;
                properties[TelemetryProperties.dataPlaneTenantId] = arg.subscription.tenantId;
                properties[TelemetryProperties.dataPlaneClientId] = arg.subscription.userId;
            }
            if (arg.label) {
                properties[TelemetryProperties.resourceName] = arg.label;
            }
        }
    }
}
