module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.spec.ts'],
    watchman: false,
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
