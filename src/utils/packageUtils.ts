// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as fs from "fs";
import { ExtensionContext } from "vscode";

export async function loadPackageInfo(context: ExtensionContext): Promise<any> {
    const raw = await fs.promises.readFile(context.asAbsolutePath("./package.json"), { encoding: 'utf-8' });

    return JSON.parse(raw);
}
