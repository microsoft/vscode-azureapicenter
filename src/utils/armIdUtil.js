"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceNameFromId = exports.getSubscriptionFromId = exports.getResourceGroupFromId = void 0;
function parseResourceId(id) {
    const matches = id.match(/\/subscriptions\/(.*)\/resourceGroups\/(.*)\/providers\/(.*)\/(.*)/);
    if (matches === null || matches.length < 3) {
        throw new Error('Invalid Azure Resource Id');
    }
    return matches;
}
function getResourceGroupFromId(id) {
    return parseResourceId(id)[2];
}
exports.getResourceGroupFromId = getResourceGroupFromId;
function getSubscriptionFromId(id) {
    return parseResourceId(id)[1];
}
exports.getSubscriptionFromId = getSubscriptionFromId;
function getServiceNameFromId(id) {
    return parseResourceId(id)[4];
}
exports.getServiceNameFromId = getServiceNameFromId;
//# sourceMappingURL=armIdUtil.js.map