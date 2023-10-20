import * as express from 'express';

export function serve(filePaths: string[]): string {
    const port = process.env.PORT || 5000;

    // Create an Express app
    const app = express();

    // Serve the HTML file
    app.get('/', (req, res) => {
        res.sendFile(filePaths[0]);
    });

    app.get('/uploads/definition.json', (req, res) => {
        res.sendFile(filePaths[1]);
    });

    // Start the server
    const server = app.listen(port);

    return `http://localhost:${port}`;
}
