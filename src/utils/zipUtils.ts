// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as fs from 'fs';
import { emptyDir } from 'fs-extra';
import * as unzipper from 'unzipper';

export async function upzip(zipFilePath: string, outputFolderPath: string) {
    // Ensure the output folder exists
    await fs.promises.mkdir(outputFolderPath, { recursive: true });

    // Deletes directory contents if the directory is not empty.
    await emptyDir(outputFolderPath);

    // unzip the file
    const directory = await unzipper.Open.file(zipFilePath);
    await directory.extract({ path: outputFolderPath });
}
