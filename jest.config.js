module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./jest.setup.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js'],
};
