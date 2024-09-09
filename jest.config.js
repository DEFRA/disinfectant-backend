module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  verbose: true,
  resetModules: true,
  clearMocks: true,
  silent: true,
  testMatch: ['**/src/**/*.test.js'],
  reporters: ['default', ['github-actions', { silent: false }], 'summary'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.server',
    '<rootDir>/src/__fixtures__',
    '<rootDir>/src/helpers/',
    '<rootDir>/src/services/powerapps/',
    '<rootDir>/src/schema/',
    '<rootDir>/src/jobs/',
    '<rootDir>/src/index.js',
    '<rootDir>/src/api/router.js',
    '<rootDir>/src/api/server.js',
    '<rootDir>/src/api/dataverse/helpers/',
    '<rootDir>/src/api/dataverse/index.js',
    '<rootDir>/src/api/health/index.js'
  ],
  coverageDirectory: '<rootDir>/coverage'
}
