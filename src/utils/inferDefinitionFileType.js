"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferDefinitionFileType = void 0;
const yaml = require("js-yaml");
/**
 * Infer the file type of a definition file.
 * @param input The contents of the file.
 */
function inferDefinitionFileType(input) {
    try {
        // Attempt to parse as JSON
        JSON.parse(input);
    }
    catch (jsonError) {
        try {
            // Attempt to parse as YAML
            const yamlObject = yaml.load(input);
        }
        catch (yamlError) {
            // Not JSON or YAML
            return '.txt';
        }
        // YAML
        return '.yaml';
    }
    // JSON
    return '.json';
}
exports.inferDefinitionFileType = inferDefinitionFileType;
//# sourceMappingURL=inferDefinitionFileType.js.map