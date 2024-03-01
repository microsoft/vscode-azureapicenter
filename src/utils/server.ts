// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as express from 'express';
import getPort from 'get-port';
import * as path from 'path';

export async function serve(folderPath: string, indexHtmlName: string) {
    const port = await getPort();

    // Create an Express app
    const app = express();

    app.use(express.static(folderPath));

    // set index.html as the default page
    app.get('/', (req, res) => {
        res.sendFile(path.join(folderPath, indexHtmlName));
    });

    // Start the server
    const server = app.listen(port);

    return {
        address: `http://localhost:${port}`,
        server,
    };
}
