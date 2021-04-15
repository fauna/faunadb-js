const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, 'wp_dist'),
    filename: 'faunadb.js',
    library: 'faunadb',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  mode: 'production',
}
