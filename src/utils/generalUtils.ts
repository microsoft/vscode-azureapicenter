// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export namespace GeneralUtils {
    export async function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
