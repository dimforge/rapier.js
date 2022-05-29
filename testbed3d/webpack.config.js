const webpack = require('webpack');
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const dist = path.resolve(__dirname, "dist");

const mode = "production";

const appConfig = {
    mode: mode,
    entry: "./src/index.js",
    devServer: {
        contentBase: dist
    },
    // plugins: [
    //     new HtmlWebpackPlugin({
    //         template: "index.html"
    //     })
    // ],
    resolve: {
        extensions: [".js"]
    },
    output: {
        path: dist,
        filename: "index.js",
        // globalObject: 'this'
    },
    plugins: [
        new CopyPlugin([
            path.resolve(__dirname, "static")
        ]),
        new webpack.IgnorePlugin(/(fs)/)
    ]
};

module.exports = appConfig;


// module.exports = [
//     'source-map'
// ].map(devtool => ({
//     mode: "development",
//     entry: {
//         index: "./src/index.js",
//         worker: "./src/physics.worker.js"
//     },
//     // module: {
//     //     rules: [
//     //         {
//     //             test: /physics\.worker\.js$/,
//     //             use: {
//     //                 loader: 'worker-loader',
//     //                 options: {
//     //                     name: '[name].[hash:8].js',
//     //                     inline: true,
//     //                     fallback: false,
//     //                 }
//     //             }
//     //         }
//     //     ],
//     // },
//     output: {
//         path: dist,
//         filename: "[name].js",
//         globalObject: 'this'
//     },
//     devServer: {
//         contentBase: dist,
//     },
//     plugins: [
//         new CopyPlugin([
//             path.resolve(__dirname, "static")
//         ]),
//         new webpack.IgnorePlugin(/(fs)/)
//     ],
//     devtool
// }));
