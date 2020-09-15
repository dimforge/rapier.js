const path = require('path');
const querystring = require('querystring');

const tsLoaderOpts = {
    configFile: 'tsconfig2d.json'
};
const ifdefLoaderOpts = {
   DIM2: true,
   DIM3: false,
   "ifdef-verbose": true,       // add this for verbose output
   "ifdef-triple-slash": false  // add this to use double slash comment instead of default triple slash
};


module.exports = {
  entry: '../../src.js/lib.ts',
  output: {
    filename: 'hirapier2d.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'hirapier2d',
    libraryTarget: 'umd'
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
              { loader: 'ts-loader', options: tsLoaderOpts },
              { loader: "ifdef-loader", options: ifdefLoaderOpts }
          ]
       }
   ]
  }
};