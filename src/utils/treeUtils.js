"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.treeUtils = void 0;
const path = require("path");
const extensionVariables_1 = require("../extensionVariables");
var treeUtils;
(function (treeUtils) {
    function getIconPath(iconName) {
        return path.join(getResourcesPath(), `${iconName}.svg`);
    }
    treeUtils.getIconPath = getIconPath;
    function getThemedIconPath(iconName) {
        return {
            light: path.join(getResourcesPath(), 'light', `${iconName}.svg`),
            dark: path.join(getResourcesPath(), 'dark', `${iconName}.svg`)
        };
    }
    treeUtils.getThemedIconPath = getThemedIconPath;
    function getResourcesPath() {
        return extensionVariables_1.ext.context.asAbsolutePath('resources');
    }
})(treeUtils || (exports.treeUtils = treeUtils = {}));
//# sourceMappingURL=treeUtils.js.map