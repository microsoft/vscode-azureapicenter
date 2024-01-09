"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = void 0;
const express = require("express");
const path = require("path");
function serve(folderPath, indexHtmlName) {
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
exports.serve = serve;
//# sourceMappingURL=server.js.map