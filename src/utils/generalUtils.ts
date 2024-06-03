// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
