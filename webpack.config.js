const path = require('path');

const config = {
  entry: './es/Champoo.js',
  output: {
    filename: 'Champoo.js',
    path: path.resolve(__dirname, 'lib'),
    library: 'Champoo',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
};

module.exports = config;
