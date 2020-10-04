const path = require('path');
const querystring = require('querystring');
const tsLoaderOpts2 = {
    configFile: 'tsconfig2d.json'
};
const ifdefLoaderOpts2 = {
    DIM2: true,
    DIM3: false,
    "ifdef-verbose": true,       // add this for verbose output
    "ifdef-triple-slash": false  // add this to use double slash comment instead of default triple slash
};

const rapier2d = {
    entry: './src/lib.ts',
    output: {
        filename: 'rapier2d.js',
        path: path.resolve(__dirname, 'pkg2'),
        library: 'rapier2d',
        libraryTarget: 'umd',
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".wasm"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {loader: 'ts-loader', options: tsLoaderOpts2},
                    {loader: "ifdef-loader", options: ifdefLoaderOpts2}
                ]
            }
        ]
    }
};


const tsLoaderOpts3 = {
    configFile: 'tsconfig3d.json'
};
const ifdefLoaderOpts3 = {
    DIM2: false,
    DIM3: true,
    "ifdef-verbose": true,       // add this for verbose output
    "ifdef-triple-slash": false  // add this to use double slash comment instead of default triple slash
};
const stringReplaceLoaderOpts3 = {
    search: 'rapier-core2d',
    replace: 'rapier-core3d'
};


const rapier3d = {
    entry: './src/lib.ts',
    output: {
        filename: 'rapier3d.js',
        path: path.resolve(__dirname, 'pkg3'),
        library: 'rapier3d',
        libraryTarget: 'umd',
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".wasm"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {loader: 'ts-loader', options: tsLoaderOpts3},
                    {loader: "ifdef-loader", options: ifdefLoaderOpts3},
                    {loader: "string-replace-loader", options: stringReplaceLoaderOpts3}
                ]
            }
        ]
    }
};

module.exports = [
    rapier2d, rapier3d
];