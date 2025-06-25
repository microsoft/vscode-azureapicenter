// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import axios from 'axios';
import * as sinon from "sinon";
import { GeneralUtils } from "../../../utils/generalUtils";

describe("GeneralUtils test cases", () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("fetchDataFromLink should call axios.get and return response data", async () => {
        // Arrange
        const link = "https://example.com/api/data";
        const mockResponseData = "mock response data";
        const axiosGetStub = sandbox.stub(axios, 'get').resolves({
            data: mockResponseData
        });

        // Act
        const result = await GeneralUtils.fetchDataFromLink(link);

        // Assert
        sinon.assert.calledOnce(axiosGetStub);
        sinon.assert.calledWith(axiosGetStub, link, {
            responseType: 'text'
        });
        sinon.assert.match(result, mockResponseData);
    }); it("fetchDataFromLink should propagate axios errors", async () => {
        // Arrange
        const link = "https://example.com/api/data";
        const errorMessage = "Network error";
        const axiosGetStub = sandbox.stub(axios, 'get').rejects(new Error(errorMessage));

        // Act & Assert
        try {
            await GeneralUtils.fetchDataFromLink(link);
            sinon.assert.fail("Expected method to throw");
        } catch (error) {
            sinon.assert.calledOnce(axiosGetStub);
            sinon.assert.calledWith(axiosGetStub, link, {
                responseType: 'text'
            });
            sinon.assert.match((error as Error).message, errorMessage);
        }
    });
});
