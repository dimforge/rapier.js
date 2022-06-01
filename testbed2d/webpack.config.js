const webpack = require('webpack');
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const dist = path.resolve(__dirname, "dist");

const mode = process.env.NODE_ENV === "development" ? "development" : "production";

/**
 * @type {import('webpack-dev-server').Configuration}
 */
const devServer = {
    static: {
        directory: dist,
    },
    allowedHosts: 'all',
    compress: true,
}

/**
 * @type {import('webpack').Configuration}
 */
const webpackConfig = {
    mode: mode,
    entry: "./src/index.js",
    devServer,
    performance: false,
    experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
    },
    output: {
        path: dist,
        filename: "index.js",
    },
    plugins: [
        new CopyPlugin({ 
            patterns: [{ from: "static", to: dist }]
        }),
    ]
};

module.exports = webpackConfig;
