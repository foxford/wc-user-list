module.exports = {
  entry: {
    demo: './demo/index.js',
    'user-list': './src/user-list.js'
  },
  output: {
    filename: '[name].js'
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
