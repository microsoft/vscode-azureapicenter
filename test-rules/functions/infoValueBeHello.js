// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
export default input => {
    if (input !== "hello") {
      return [
        {
          message: 'Value must equal "hello".',
        },
      ];
    }
  };