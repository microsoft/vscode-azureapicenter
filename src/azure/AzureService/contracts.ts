// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export type RoleAssignmentPayload = {
    properties: {
        roleDefinitionId: string;
        principalId: string;
        principalType: string;
    };
};
