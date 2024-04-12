export default {
    verbose: true,
    testEnvironment: 'jsdom',
    preset: 'ts-jest',
    transform: {
        '.(js)': 'babel-jest',
        '.(ts|tsx)': 'ts-jest',
    },
    // moduleNameMapper: {
    //     '^@equinor/fusion-framework-react/hooks$': './node_modules/@equinor/fusion-framework-react/src/hooks',
    // },
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    // transformIgnorePatterns: ['<rootDir>/node_modules/?!(@equinor/fusion|@equinor/fusion-framework-react/hooks)'],
    setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
}
