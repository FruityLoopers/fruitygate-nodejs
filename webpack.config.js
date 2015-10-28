var path = require('path');

var outdir = path.join(__dirname,'assets');

module.exports = {
  entry: './client/main.js',
  debug: true,
  devtool: 'source-map',
  output: {
    path: outdir,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
    { test: path.join(__dirname, 'client'),
      loader: 'babel-loader' }
    ]
  }
};

