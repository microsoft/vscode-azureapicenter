// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import axios from 'axios';
import { assert } from "chai";
import * as path from "path";
import * as sinon from "sinon";
import { UiStrings } from "../../../uiStrings";
import { GeneralUtils } from "../../../utils/generalUtils";
describe("GeneralUtils", () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });
    describe("getTemplatesFolder", () => {
        it("should return the correct templates folder path", () => {
            // Act
            const result = GeneralUtils.getTemplatesFolder();

            // Assert
            assert.isString(result);
            assert.isTrue(result.includes("templates"));
            assert.equal(result, path.join(__dirname, "..", "..", "..", "templates"));
        });
    });

    describe("validateInputForTitle", () => {
        it("should return error message when value is empty", () => {
            // Arrange
            const emptyValue = "";

            // Act
            const result = GeneralUtils.validateInputForTitle(emptyValue);

            // Assert
            assert.equal(result, UiStrings.ValueNotBeEmpty);
        });

        it("should return error message when value is null or undefined", () => {
            // Act
            const resultNull = GeneralUtils.validateInputForTitle(null as any);
            const resultUndefined = GeneralUtils.validateInputForTitle(undefined as any);

            // Assert
            assert.equal(resultNull, UiStrings.ValueNotBeEmpty);
            assert.equal(resultUndefined, UiStrings.ValueNotBeEmpty);
        });

        it("should return error message when value contains only special characters", () => {
            // Arrange
            const specialCharsOnly = "!@#$%^&*()";

            // Act
            const result = GeneralUtils.validateInputForTitle(specialCharsOnly);

            // Assert
            assert.equal(result, UiStrings.ValueMustContainLetterOrNumber);
        });

        it("should return error message when value contains only spaces", () => {
            // Arrange
            const spacesOnly = "   ";

            // Act
            const result = GeneralUtils.validateInputForTitle(spacesOnly);

            // Assert
            assert.equal(result, UiStrings.ValueMustContainLetterOrNumber);
        });

        it("should return undefined when value contains letters", () => {
            // Arrange
            const validValues = [
                "test",
                "Test123",
                "test-api",
                "test_api",
                "test api",
                "123test",
                "test!@#123"
            ];

            // Act & Assert
            validValues.forEach(value => {
                const result = GeneralUtils.validateInputForTitle(value);
                assert.isUndefined(result, `Expected undefined for value: ${value}`);
            });
        });

        it("should return undefined when value contains only numbers", () => {
            // Arrange
            const numbersOnly = "123456";

            // Act
            const result = GeneralUtils.validateInputForTitle(numbersOnly);

            // Assert
            assert.isUndefined(result);
        });
    });

    describe("validateURI", () => {
        it("should return null for valid URLs", () => {
            // Arrange
            const validUrls = [
                "https://example.com",
                "http://localhost:3000",
                "https://api.example.com/v1/users",
                "https://example.com:8080/path?query=value",
                "ftp://files.example.com",
                "https://user:pass@example.com",
                "https://192.168.1.1:8080",
                "https://example.com/path/to/resource#section"
            ];

            // Act & Assert
            validUrls.forEach(url => {
                const result = GeneralUtils.validateURI(url);
                assert.isNull(result, `Expected null for URL: ${url}`);
            });
        });

        it("should return error message for invalid URLs", () => {
            // Arrange
            const invalidUrls = [
                "not-a-url",
                "example.com", // Missing protocol
                "://example.com", // Missing protocol
                "http://", // Incomplete URL
                "   ", // Whitespace only
                "", // Empty string
            ];

            // Act & Assert
            invalidUrls.forEach(url => {
                const result = GeneralUtils.validateURI(url);
                assert.equal(result, UiStrings.ValidUrlStart, `Expected error for URL: ${url}`);
            });
        });

        it("should return error message for null or undefined", () => {
            // Act
            const resultNull = GeneralUtils.validateURI(null as any);
            const resultUndefined = GeneralUtils.validateURI(undefined as any);

            // Assert
            assert.equal(resultNull, UiStrings.ValidUrlStart);
            assert.equal(resultUndefined, UiStrings.ValidUrlStart);
        });

        it("should handle URLs with special characters in path and query", () => {
            // Arrange
            const urlsWithSpecialChars = [
                "https://example.com/path%20with%20spaces",
                "https://example.com/api/v1?key=value&other=test",
                "https://example.com/path#anchor",
            ];

            // Act & Assert
            urlsWithSpecialChars.forEach(url => {
                const result = GeneralUtils.validateURI(url);
                assert.isNull(result, `Expected null for URL: ${url}`);
            });
        });
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
    });
    it("fetchDataFromLink should propagate axios errors", async () => {
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
