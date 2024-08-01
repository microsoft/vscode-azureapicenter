// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { ApiCenter, ApiCenterApi, ApiCenterApiVersion, ApiCenterApiVersionDefinition, GeneralApiCenter, GeneralApiCenterApi, GeneralApiCenterApiVersion, GeneralApiCenterApiVersionDefinition } from "./contracts";

function checkObj(obj: any): boolean {
    return obj && 'id' in obj && 'properties' in obj && typeof obj.properties == 'object';
}

export function isApiCenterServiceManagement(obj: GeneralApiCenter): obj is ApiCenter {
    return checkObj(obj);
}

export function isApiCenterManagement(obj: GeneralApiCenterApi): obj is ApiCenterApi {
    return checkObj(obj);
}

export function isApiCenterVersionManagement(obj: GeneralApiCenterApiVersion): obj is ApiCenterApiVersion {
    return checkObj(obj);
}

export function isApiCenterVersionDefinitionManagement(obj: GeneralApiCenterApiVersionDefinition): obj is ApiCenterApiVersionDefinition {
    return checkObj(obj);
}
