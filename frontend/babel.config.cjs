module.exports = function(api) {
    api.cache(true)

    const presets = ['@babel/preset-env', '@babel/preset-react']

    const env = {
        test: {
            presets: [
                ['@babel/preset-env', { targets: { node: 'current' } }],
                '@babel/preset-react',
            ],
        },
    }

    return {
        presets,
        env,
    }
}
