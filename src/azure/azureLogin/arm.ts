// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { SubscriptionClient } from "@azure/arm-resources-subscriptions";
import { PagedAsyncIterableIterator } from "@azure/core-paging";
import { Environment, EnvironmentParameters } from "@azure/ms-rest-azure-env";
import * as vscode from "vscode";
import { Errorable, getErrorMessage } from "../../utils/utils";
import { ReadyAzureSessionProvider } from "./authTypes";
import { getCredential, getEnvironment } from "./azureAuth";

export function getSubscriptionClient(sessionProvider: ReadyAzureSessionProvider): SubscriptionClient {
    return new SubscriptionClient(getCredential(sessionProvider), { endpoint: getArmEndpoint() });
}

function getArmEndpoint(): string {
    return getEnvironment().resourceManagerEndpointUrl;
}

export async function listAll<T>(iterator: PagedAsyncIterableIterator<T>): Promise<Errorable<T[]>> {
    const result: T[] = [];
    try {
        for await (const page of iterator.byPage()) {
            result.push(...page);
        }
        return { succeeded: true, result };
    } catch (e) {
        return { succeeded: false, error: `Failed to list resources: ${getErrorMessage(e)}` };
    }
}

export function getConfiguredAzureEnv(): Environment {
    // See:
    // https://github.com/microsoft/vscode/blob/eac16e9b63a11885b538db3e0b533a02a2fb8143/extensions/microsoft-authentication/package.json#L40-L99
    const section = "microsoft-sovereign-cloud";
    const settingName = "environment";
    const authProviderConfig = vscode.workspace.getConfiguration(section);
    const environmentSettingValue = authProviderConfig.get<string | undefined>(settingName);

    if (environmentSettingValue === "ChinaCloud") {
        return Environment.ChinaCloud;
    } else if (environmentSettingValue === "USGovernment") {
        return Environment.USGovernment;
    } else if (environmentSettingValue === "custom") {
        const customCloud = authProviderConfig.get<EnvironmentParameters | undefined>("customEnvironment");
        if (customCloud) {
            return new Environment(customCloud);
        }

        throw new Error(
            `The custom cloud choice is not configured. Please configure the setting ${section}.${settingName}.`,
        );
    }

    return Environment.get(Environment.AzureCloud.name);
}
