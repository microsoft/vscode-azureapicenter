import * as express from 'express';

export function serve(fileMap: Map<string, string>): string {
    const port = process.env.PORT || 5000;

    // Create an Express app
    const app = express();

    // map the files to the routes
    for (let [key, value] of fileMap) {
        app.get(key, (req, res) => {
            res.sendFile(value);
        });
    }

    // Start the server
    const server = app.listen(port);

    return `http://localhost:${port}`;
}
