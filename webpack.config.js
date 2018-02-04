const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const cleanWebpack = new CleanWebpackPlugin(['dist'], { verbose: true });

const copyWebpack = new CopyWebpackPlugin([{
  from: './src/manifest.json',
  transform: (content, path) => {
    // generates the manifest file using the package.json informations
    return Buffer.from(JSON.stringify({
      description: process.env.npm_package_description,
      version: process.env.npm_package_version,
      ...JSON.parse(content.toString())
    }));
  }
}]);

const config = {
  entry: {
    popup: path.join(__dirname, 'src', 'popup.js'),
    options: path.join(__dirname, 'src', 'options.js'),
    background: path.join(__dirname, 'src', 'background.js'),
    inject: path.join(__dirname, 'src/inject', 'index.js'),
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: ['babel-loader'],
        exclude: /node_modules/,
      },
    ]
  },
  plugins: [
    cleanWebpack,
    copyWebpack,
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/templates', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
      inject: 'body',
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/templates', 'options.html'),
      filename: 'options.html',
      chunks: ['options'],
      inject: 'body',
    }),
  ]
}

module.exports = config;

