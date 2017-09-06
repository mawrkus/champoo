const path = require('path');

const config = {
  entry: './es/LazyLoader.js',
  output: {
    filename: 'LazyLoader.js',
    path: path.resolve(__dirname, 'lib'),
    library: 'LazyLoader',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
};

module.exports = config;
