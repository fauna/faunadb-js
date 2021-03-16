const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = env => ({
  entry: path.resolve(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, 'wp_dist'),
    filename: 'faunadb.js',
    library: 'faunadb',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  mode: 'production',
  ...(env.analyze && {
    plugins: [
      new BundleAnalyzerPlugin(
        env.stats
          ? {
              analyzerMode: 'disabled',
              generateStatsFile: true,
            }
          : {}
      ),
    ],
  }),
})
