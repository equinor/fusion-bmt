const webpack = require('webpack');

const GitRevisionPlugin = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin({
    commithashCommand: 'rev-parse --short HEAD',
    versionCommand: "log -1 --date=short --pretty=format:'%cd'"
});

const APP_VERSION = process.env.npm_package_version;

let isProduction = false;
if (process.env.BUILD_MODE && process.env.BUILD_MODE === "production") {
    isProduction = true;
}
const mode = isProduction ? 'production' : 'development';

const API_URL = process.env.API_URL || 'http://localhost:5000';
const AD_APP_ID = process.env.AD_CLIENT_ID || '8829d4ca-93e8-499a-8ce1-bc0ef4840176'

console.log("--- MODE:", mode, "API_URL:", API_URL);

module.exports = {
    mode: mode,
    plugins: [
        new webpack.DefinePlugin({
            API_URL: JSON.stringify(API_URL),
            APP_VERSION: JSON.stringify(APP_VERSION),
            COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
            BRANCH: JSON.stringify(gitRevisionPlugin.branch()),
            LAST_COMMIT: JSON.stringify(gitRevisionPlugin.version()),
            AD_APP_ID: JSON.stringify(AD_APP_ID)
        })
    ]
};
