// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as path from 'path';
import { getDefaultWorkspacePath, getSessionWorkingFolderName } from './fsUtil';

export async function getRulesFolderPath(apiCenterName: string): Promise<string> {
    return path.join(getDefaultWorkspacePath(), getSessionWorkingFolderName(), 'rules', apiCenterName);
}
