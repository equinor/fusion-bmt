const webpack = require('webpack')
require('dotenv').config({ path: './.env' })
const Dotenv = require('dotenv-webpack')

let isProduction = false
if (process.env.BUILD_MODE && process.env.BUILD_MODE === 'production') {
    isProduction = true
}
const mode = isProduction ? 'production' : 'development'

const API_URL = process.env.API_URL
const AD_APP_ID = process.env.AD_CLIENT_ID || '8829d4ca-93e8-499a-8ce1-bc0ef4840176'
const APP_INSIGHTS_KEY = process.env.APP_INSIGHTS_KEY || ''

console.log('--- MODE:', mode, 'API_URL:', API_URL)

module.exports = {
    mode: mode,
    ...(isProduction ? {} : { devtool: 'eval-source-map' }),
    plugins: [
        new webpack.DefinePlugin({
            API_URL: JSON.stringify(API_URL),
            AD_APP_ID: JSON.stringify(AD_APP_ID),
            APP_INSIGHTS: JSON.stringify(APP_INSIGHTS_KEY),
        }),
        new Dotenv(),
    ],
}
