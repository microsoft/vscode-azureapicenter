// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import * as yaml from 'js-yaml';

export type DefinitionFileType = '.json' | '.yaml' | '.txt';

/**
 * Infer the file type of a definition file.
 * @param input The contents of the file.
 */
export function inferDefinitionFileType(input: string): DefinitionFileType {
  try {
    // Attempt to parse as JSON
    JSON.parse(input);

  } catch (jsonError) {
    try {
      // Attempt to parse as YAML
      const yamlObject = yaml.load(input);

    } catch (yamlError) {
      // Not JSON or YAML
      return '.txt';
    }

    // YAML
    return '.yaml';
  }

  // JSON
  return '.json';
}
