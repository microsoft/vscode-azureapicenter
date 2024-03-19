// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { defineConfig } from '@playwright/test';
import { TestOptions } from './baseTest';

export default defineConfig<void, TestOptions>({
    reporter: process.env.CI ? 'html' : 'list',
    timeout: 120_000,
    workers: 1,
    expect: {
        timeout: 30_000,
    },
    globalSetup: './globalSetup',
    projects: [
        {
            name: 'VSCode stable',
            use: {
                vscodeVersion: 'stable',
            }
        }
    ]
});
