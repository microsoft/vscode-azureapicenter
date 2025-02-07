// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
interface context {
    vars: any[];
}
export default function createContextWithTuple<T extends unknown[]>(
    ...params: [...T]
): context {
    return {
        vars: [...params]
    };
}
