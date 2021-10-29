module.exports = {
    verbose: true,
    testEnvironment: 'jsdom',
    transform: {
        '.(js)': 'babel-jest',
        '.(ts|tsx)': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    transformIgnorePatterns: ['<rootDir>/node_modules/?!(@equinor/fusion)'],
    setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
}
