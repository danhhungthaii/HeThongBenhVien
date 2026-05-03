module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/app.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: { branches: 50, functions: 50, lines: 50, statements: 50 },
  },
  setupFilesAfterEnv: ['./tests/setup.js'],
  globalSetup: './tests/jestGlobalSetup.js',
  globalTeardown: './tests/jestGlobalTeardown.js',
  testTimeout: 15000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
