// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

"use strict";

const path = require("path");
const terserWebpackPlugin = require("terser-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
    target: "node", // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

    entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, "dist"),
        filename: "extension.js",
        libraryTarget: "commonjs2",
    },
    externals: {
        vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        // modules added here also need to be added in the .vscodeignore file
        "applicationinsights-native-metrics":
            "commonjs applicationinsights-native-metrics", // ignored because we don't ship native module
        "@aws-sdk/client-s3": "commonjs @aws-sdk/client-s3", // optional dependency of unzipper, not needed
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: [".ts", ".js"],
        // Force a single (CommonJS) copy of dual-published (ESM+CJS) packages.
        // Packages like @microsoft/vscode-azext-* ship both an "import" (ESM) and
        // "require" (CJS) build via the package "exports" field. Without pinning the
        // condition, webpack can bundle BOTH builds, producing two instances of a
        // module's singletons (e.g. the azext-utils `ext`). That breaks
        // registerUIExtensionVariables at runtime ("must be called before using the
        // @microsoft/vscode-azext-utils package"). Preferring "require" keeps one copy.
        conditionNames: ["require", "node", "default"],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
        ],
    },
    devtool: "nosources-source-map",
    infrastructureLogging: {
        level: "log", // enables logging required for problem matchers
    },
    optimization: {
        minimizer: [
            new terserWebpackPlugin({
                terserOptions: {
                    mangle: false,
                    keep_fnames: true,
                },
            }),
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "node_modules/widdershins/templates/openapi3",
                    to: "../templates/openapi3",
                },
            ],
        }),
    ],
};
module.exports = [extensionConfig];
