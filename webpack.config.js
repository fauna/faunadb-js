const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const packageJson = require('./package.json')

module.exports = env => ({
  entry: path.resolve(__dirname, 'src/index.js'),
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'faunadb.js',
    library: 'faunadb',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: 'umd',
                  targets: packageJson.browserslist,
                },
              ],
            ],
          },
        },
      },
    ],
  },
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
