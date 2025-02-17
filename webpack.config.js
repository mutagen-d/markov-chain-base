const path = require('path');

module.exports = (_, argv) => ({
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `markov-chain${argv.mode === 'production' ? '.min' : '.dev'}.js`,
    library: {
      type: 'window'
    },
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
    }],
  },
  watch: false,
  watchOptions: {
    aggregateTimeout: 1000,
    poll: 2000,
  },
  devtool: false,
  optimization: {
    minimize: true,
  },
  plugins: []
});
