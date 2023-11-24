const { HttpHeaders } = require("@azure/ms-rest-js");

export function getCredentialForToken(accessToken: any) {
    return {
      signRequest: (request: any) => {
        if (!request.headers) request.headers = new HttpHeaders();
        request.headers.set("Authorization", `Bearer ${accessToken.token}`);
        return Promise.resolve(request);
      }
    };
}