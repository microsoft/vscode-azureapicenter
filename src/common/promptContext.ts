// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
interface context {
    vars: { [key: string]: any };
}

export default function createContextWithNamed(vars: { [key: string]: any }): context {
    return { vars };
}
