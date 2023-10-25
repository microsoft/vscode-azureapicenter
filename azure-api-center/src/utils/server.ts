import * as express from 'express';
import * as path from 'path';

export function serve(folderPath: string, indexHtmlName: string): string {
    const port = process.env.PORT || 5000;

    // Create an Express app
    const app = express();

    app.use(express.static(folderPath));

    // set index.html as the default page
    app.get('/', (req, res) => {
        res.sendFile(path.join(folderPath, indexHtmlName));
    });

    // Start the server
    const server = app.listen(port);

    return `http://localhost:${port}`;
}
