// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as archiver from 'archiver';
import * as fs from 'fs';
import { emptyDir } from 'fs-extra';
import { PassThrough } from 'stream';
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

export async function zipFolderToBuffer(sourceDirectory: string): Promise<Buffer> {
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // Create a pass-through stream to act as a writable stream for archiver
    const stream = new PassThrough();

    // Use the stream with archiver
    archive.pipe(stream);

    // Append files from a directory
    archive.directory(sourceDirectory, false);

    // Finalize the archive (i.e., finish appending files and finalize the archive)
    archive.finalize();

    // Collect chunks of data as they are processed by archiver
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => {
        chunks.push(chunk);
    });

    // Return a promise that resolves with the concatenated chunks as a Buffer
    return new Promise((resolve, reject) => {
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', (err) => reject(err));
    });
}
