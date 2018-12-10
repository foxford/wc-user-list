const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: {
    'user-list': './src/index.js'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'WCUserList'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "postcss-loader"
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true
    }),
  ]
}
