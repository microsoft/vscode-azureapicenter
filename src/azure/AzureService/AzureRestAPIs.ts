// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export const AzureRestAPIs = {
    CreateOrUpdateRoleAssignment: (scope: string, roleAssignmentName: string, restApiVersion: string) => `https://management.azure.com/${scope}/providers/Microsoft.Authorization/roleAssignments/${roleAssignmentName}?api-version=${restApiVersion}`,
};
