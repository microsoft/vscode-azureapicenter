// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ApiCenterApiVersionDefinitionExport } from "../azure/ApiCenter/contracts";

export interface ApiCenterApiVersionDefinitionExportWithType extends ApiCenterApiVersionDefinitionExport {
    type: string;
}
