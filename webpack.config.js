const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        options: path.join(__dirname, './src/options.js'),
        content: path.join(__dirname, './src/content.js')
    },
    output: {
        path: path.join(__dirname, './build'),
        filename: '[name].js'
    },
    plugins: [
        new CleanWebpackPlugin('build'),
        new CopyWebpackPlugin([{ from: 'src', ignore: '*.js' }])
    ]
};

switch (process.env.NODE_ENV) {
    case 'development':
        // module.exports.devtool = 'inline-source-map';
        break;
    case 'production':
        break;
}
