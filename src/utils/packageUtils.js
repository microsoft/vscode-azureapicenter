"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPackageInfo = void 0;
const fs = require("fs");
async function loadPackageInfo(context) {
    const raw = await fs.promises.readFile(context.asAbsolutePath("./package.json"), { encoding: 'utf-8' });
    return JSON.parse(raw);
}
exports.loadPackageInfo = loadPackageInfo;
//# sourceMappingURL=packageUtils.js.map