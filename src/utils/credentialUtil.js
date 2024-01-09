"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCredentialForToken = void 0;
const { HttpHeaders } = require("@azure/ms-rest-js");
function getCredentialForToken(accessToken) {
    return {
        signRequest: (request) => {
            if (!request.headers)
                request.headers = new HttpHeaders();
            request.headers.set("Authorization", `Bearer ${accessToken.token}`);
            return Promise.resolve(request);
        }
    };
}
exports.getCredentialForToken = getCredentialForToken;
//# sourceMappingURL=credentialUtil.js.map