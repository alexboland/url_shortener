const path = require('path');
const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  entry: './client/src/App.js',
  watch: false,
  mode: 'production',
  devtool: "source-map",
  optimization: {
    minimizer: [new UglifyWebpackPlugin({ sourceMap: true })],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test:/\.css$/,
        loaders: [
          'style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]&sourceMap&-minimize'
        ]
      }
    ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'client/public/')
  }
};