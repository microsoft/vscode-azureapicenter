// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
interface context {
    vars: any[];
}
export default function createContextWithTuple<T extends any[]>(...params: T): { vars: { [key: string]: any } } {
    const context = {
        vars: {} as { [key: string]: any }
    };

    params.forEach((param, index) => {
        context.vars[`param${index + 1}`] = param;
    });

    return context;
}
