const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    options: path.join(__dirname, './src/options.ts'),
    content: path.join(__dirname, './src/content.ts')
  },
  output: {
    path: path.join(__dirname, './build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new CleanWebpackPlugin('build', { verbose: false }),
    new CopyWebpackPlugin([
      { from: 'src', ignore: ['*.js', '*.ts', '.DS_Store'] }
    ])
  ]
};

switch (process.env.NODE_ENV) {
  case 'development':
    module.exports.devtool = 'inline-source-map';
    break;
  case 'production':
    break;
}
