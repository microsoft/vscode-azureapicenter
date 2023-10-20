import * as express from 'express';

export function serve(filePath: string): string {
    const port = process.env.PORT || 8080;

    // Create an Express app
    const app = express();

    // Serve the HTML file
    app.get('/', (req, res) => {
        res.sendFile(filePath);
    });

    // Start the server
    const server = app.listen(port);

    return `http://localhost:${port}`;
}
