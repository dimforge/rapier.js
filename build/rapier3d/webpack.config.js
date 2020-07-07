const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

const dist = path.resolve(__dirname, "dist");

module.exports = {
    mode: "production",
    entry: {
        index: "./js/index.js"
    },
    output: {
        path: dist,
        filename: "[name].js",
        library: "rapier3d"
    },
    devServer: {
        contentBase: dist,
    },
    plugins: [
        new WasmPackPlugin({
            crateDirectory: __dirname,
            forceMode: "development"
        }),
    ]
};