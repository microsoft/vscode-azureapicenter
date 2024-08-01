// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { ApiCenter, ApiCenterApi, ApiCenterApiVersion, ApiCenterApiVersionDefinition, GeneralApiCenter, GeneralApiCenterApi, GeneralApiCenterApiVersion, GeneralApiCenterApiVersionDefinition } from "./contracts";

export function isApiCenterServiceManagement(obj: GeneralApiCenter): obj is ApiCenter {
    return obj && 'id' in obj && 'properties' in obj && typeof obj.properties == 'object';
}

export function isApiCenterManagement(obj: GeneralApiCenterApi): obj is ApiCenterApi {
    return obj && 'id' in obj && 'properties' in obj && typeof obj.properties == 'object';
}

export function isApiCenterVersionManagement(obj: GeneralApiCenterApiVersion): obj is ApiCenterApiVersion {
    return obj && 'id' in obj && 'properties' in obj && typeof obj.properties == 'object';
}

export function isApiCenterVersionDefinitionManagement(obj: GeneralApiCenterApiVersionDefinition): obj is ApiCenterApiVersionDefinition {
    return obj && 'id' in obj && 'properties' in obj && typeof obj.properties == 'object';
}
