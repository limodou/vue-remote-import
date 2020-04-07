const path = require('path');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: 'vue-remote-import.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'vue-remote-import',
    libraryTarget: 'umd'

  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'usage'
              }
            ]
          ]
        }
      }
    }]
  },
  plugins: [
    new CleanWebpackPlugin()
  ]
};