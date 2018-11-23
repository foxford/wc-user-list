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
        use: [
          'postcss-loader'
        ]
      }
    ]
  }
}
