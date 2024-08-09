// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { ServiceClientOptions } from "@azure/ms-rest-js";

const userAgentValue = "vscode-azure-api-center";

export const clientOptions: ServiceClientOptions = {
    userAgent: (defaultUserAgent: string) => {
        return `${userAgentValue} ${defaultUserAgent}`;
    }
};
