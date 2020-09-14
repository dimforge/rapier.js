const path = require('path');

module.exports = {
  entry: './src/lib.ts',
  output: {
    filename: 'hirapier2d.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".wasm"]
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: "ts-loader"
    }]
  }
};