"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTree = void 0;
const extensionVariables_1 = require("../extensionVariables");
async function refreshTree(context) {
    // we're assuming this is a manual refresh, so we should wait for the tree to be ready
    await extensionVariables_1.ext.treeItem.refresh(context);
}
exports.refreshTree = refreshTree;
//# sourceMappingURL=refreshTree.js.map