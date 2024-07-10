// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export default (targetVal, opts, paths) => {
    const errors = [];
    const operationIds = new Set();

    Object.values(targetVal.paths || {}).forEach((pathItem) => {
        Object.values(pathItem).forEach((operation) => {
            if (operation.operationId && operationIds.has(operation.operationId)) {
                errors.push({
                    message: `Duplicate operationId found: ${operation.operationId}`,
                    path: [...paths.path, 'paths', operation.operationId] // Adjust the path as necessary
                });
            } else {
                operationIds.add(operation.operationId);
            }
        });
    });

    return errors;
};