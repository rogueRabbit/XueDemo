const path = require('path');
const HtmlWebpackplugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        main: "./test.js"
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    devtool: 'cheap-module-eval-source-map',
    module: {
        rules: [
            {
                test: /\.m?js/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-object-rest-spread', "@babel/plugin-proposal-class-properties"]
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackplugin({
            title: 'xue项目',
            template: 'index.html'
        })
    ]
}