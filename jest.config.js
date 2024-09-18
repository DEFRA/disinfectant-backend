module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  verbose: true,
  resetModules: true,
  clearMocks: true,
  silent: true,
  testMatch: ['**/src/**/*.test.js'],
  reporters: ['default', ['github-actions', { silent: false }], 'summary'],
  // collectCoverageFrom: ['src/**/**/controller.js','src/**/**/dataverse.js','src/services/powerapps/auth.js','src/helpers/databaseTransaction.js','src/helpers/proxy-agent.js','src/helpers/proxy-fetch.js','src/helpers/constants.js'],
  collectCoverageFrom: ['src/**/**/controller.js'],
  coveragePathIgnorePatterns: [],
  coverageDirectory: '<rootDir>/coverage'
}
